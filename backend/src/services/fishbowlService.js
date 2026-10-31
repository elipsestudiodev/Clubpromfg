const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class FishbowlService {
  constructor() {
    this.baseURL = process.env.FISHBOWL_API_URL;
    this.token = null;
    this.tokenExpiry = null;
    this._loginPromise = null;   // single-flight login (avoid parallel logins eating Fishbowl seats)
    this._tokenLoaded = false;   // whether we already tried loading the persisted token from DB
  }

  isConfigured() {
    return Boolean(
      process.env.FISHBOWL_API_URL &&
      process.env.FISHBOWL_USERNAME &&
      process.env.FISHBOWL_PASSWORD
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Token persistence (DB) — token survives backend restarts, so we
  // don't create a new Fishbowl session on every restart/request.
  // Table is created automatically (no Prisma migration required).
  // ─────────────────────────────────────────────────────────────
  async _ensureSessionTable() {
    if (this._tableReady) return;
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS fishbowl_session (
        id INT PRIMARY KEY,
        token TEXT NULL,
        session_id VARCHAR(255) NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    this._tableReady = true;
  }

  async _loadStoredToken() {
    if (this._tokenLoaded) return this.token;
    this._tokenLoaded = true;
    try {
      await this._ensureSessionTable();
      const rows = await prisma.$queryRawUnsafe('SELECT token FROM fishbowl_session WHERE id = 1');
      if (rows?.[0]?.token) {
        this.token = rows[0].token;
        console.log('[Fishbowl] Reusing stored session token from database');
      }
    } catch (err) {
      console.warn('[Fishbowl] Could not load stored token:', err.message);
    }
    return this.token;
  }

  async _saveToken(token, sessionId = null) {
    try {
      await this._ensureSessionTable();
      await prisma.$executeRawUnsafe(
        'INSERT INTO fishbowl_session (id, token, session_id) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE token = VALUES(token), session_id = VALUES(session_id)',
        token,
        sessionId
      );
    } catch (err) {
      console.warn('[Fishbowl] Could not persist token:', err.message);
    }
  }

  async login({ force = false } = {}) {
    if (!this.isConfigured()) {
      throw new Error('Fishbowl credentials or API URL missing in .env');
    }

    if (!force) {
      if (this.token) return this.token;
      await this._loadStoredToken();
      if (this.token) return this.token;
    }

    // Single-flight: if a login is already running, wait for it instead of opening another session
    if (this._loginPromise) return this._loginPromise;

    this._loginPromise = (async () => {
      try {
        console.log(`[Fishbowl] Authenticating with ${this.baseURL}...`);
        const response = await axios.post(
          `${this.baseURL}/api/login`,
          {
            appName: 'ClubProEcom',
            appDescription: 'E-commerce Integration with Prisma & WorldShip',
            appId: 45821,
            username: process.env.FISHBOWL_USERNAME,
            password: process.env.FISHBOWL_PASSWORD,
          },
          { timeout: 15000 }
        );

        if (!response.data?.token) {
          throw new Error('No token received from Fishbowl API');
        }

        this.token = response.data.token;
        await this._saveToken(this.token, response.data.sessionId ? String(response.data.sessionId) : null);
        console.log('[Fishbowl] Login successful (token stored in database)');
        return this.token;
      } catch (err) {
        console.error('[Fishbowl] Login failed:', err.response?.data || err.message);
        throw new Error(`Fishbowl authentication failed: ${err.message}`);
      } finally {
        this._loginPromise = null;
      }
    })();

    return this._loginPromise;
  }

  async logout() {
    if (!this.token) return;
    const tokenToLogout = this.token;
    this.token = null;
    await this._saveToken(null, null);
    try {
      await axios.post(
        `${this.baseURL}/api/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${tokenToLogout}` },
          timeout: 5000,
        }
      );
      console.log('[Fishbowl] Logout successful');
    } catch (err) {
      console.error('[Fishbowl] Logout failed:', err.response?.data || err.message);
    }
  }

  async request(method, endpoint, data = null, customHeaders = {}) {
    if (!this.isConfigured()) {
      console.warn('[Fishbowl Notice] Fishbowl is not configured. Request skipped:', endpoint);
      return null;
    }

    const { contentType, _isRetry, ...extraHeaders } = customHeaders;

    if (!this.token) {
      await this.login();
    }

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': contentType || 'application/json',
        ...extraHeaders,
      },
      data,
      timeout: 20000,
    };

    try {
      const res = await axios(config);
      return res.data;
    } catch (err) {
      // Session expired / invalidated → re-login once and retry transparently
      if (err.response?.status === 401 && !_isRetry) {
        console.log('[Fishbowl] Session expired, re-logging in automatically...');
        this.token = null;
        await this.login({ force: true });
        return this.request(method, endpoint, data, { ...customHeaders, _isRetry: true });
      }

      console.error('[Fishbowl API Error]', {
        endpoint,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. Part & Product Sync (Inventory + Sellable Items)
  // ─────────────────────────────────────────────────────────────
  async importPart(csvString) {
    return this.request('POST', '/api/import/Part', csvString, {
      contentType: 'text/plain',
    });
  }

  async importProduct(csvString) {
    return this.request('POST', '/api/import/Product', csvString, {
      contentType: 'text/plain',
    });
  }

  async syncProduct(product) {
    if (!this.isConfigured()) return null;

    try {
      const partNumber = (product.sku?.trim() || product.fishbowlPartNumber?.trim() || `PART-${product.id}`).replace(/"/g, '""');
      const name = (product.name || '').replace(/"/g, '""');
      const description = (product.description || name).replace(/"/g, '""');
      const price = product.regularPrice ? Number(product.regularPrice).toFixed(2) : '0.00';
      const weight = product.weightLb ? Number(product.weightLb).toFixed(2) : '1';
      const length = product.lengthIn ? Number(product.lengthIn).toFixed(2) : '10';
      const width = product.widthIn ? Number(product.widthIn).toFixed(2) : '10';
      const height = product.heightIn ? Number(product.heightIn).toFixed(2) : '5';

      // 1. Create/Update Part
      const partHeader = `"PartNumber","PartDescription","PartDetails","UOM","PartType","Active","POItemType","Weight","WeightUOM","Width","WidthUOM","Height","HeightUOM","Length","LengthUOM","Price"`;
      const partRow = `"${partNumber}","${name}","${description}","ea","Inventory","true","Purchase","${weight}","lbs","${width}","in","${height}","in","${length}","in","${price}"`;
      const partCsv = `${partHeader}\n${partRow}`;

      console.log(`[Fishbowl] Syncing Part for product ID ${product.id} ("${partNumber}")...`);
      const result = await this.importPart(partCsv);
      console.log(`[Fishbowl] Successfully synced Part "${partNumber}"`);

      // 2. Create/Update Product Mapping
      try {
        const productHeader = `"PartNumber","ProductNumber","ProductDescription","Price","UOM","Active"`;
        const productRow = `"${partNumber}","${partNumber}","${name}","${price}","ea","true"`;
        const productCsv = `${productHeader}\n${productRow}`;

        await this.importProduct(productCsv);
        console.log(`[Fishbowl] Successfully synced Product mapping for "${partNumber}"`);
      } catch (prodErr) {
        console.warn(`[Fishbowl Product Mapping Warning]:`, prodErr.response?.data?.message || prodErr.message);
      }

      return { partNumber, result };
    } catch (err) {
      console.error(`[Fishbowl] Error syncing product ID ${product.id}:`, err.response?.data || err.message);
      throw err;
    }
  }

  async partExists(partNumber) {
    if (!partNumber || !this.isConfigured()) return false;
    try {
      const res = await this.request('GET', `/api/parts?number=${encodeURIComponent(partNumber)}`);
      return Boolean(res && res.totalCount > 0 && Array.isArray(res.results) && res.results.length > 0);
    } catch (err) {
      console.warn(`[Fishbowl] Check part existence warning for "${partNumber}":`, err.response?.data?.message || err.message);
      return false;
    }
  }

  async deactivateProduct(partNumber) {
    if (!partNumber || !this.isConfigured()) return;
    try {
      console.log(`[Fishbowl] Checking if Part "${partNumber}" exists in Fishbowl before deactivating...`);
      const exists = await this.partExists(partNumber);
      if (!exists) {
        console.log(`[Fishbowl Notice] Part "${partNumber}" does not exist in Fishbowl. Skipping deactivation.`);
        return;
      }

      console.log(`[Fishbowl] Deactivating Part & Product "${partNumber}"...`);
      const partHeader = '"PartNumber","PartDescription","UOM","PartType","Active","POItemType"';
      const partRow = `"${partNumber}","${partNumber}","ea","Inventory","false","Purchase"`;
      const partCsv = `${partHeader}\n${partRow}`;
      await this.importPart(partCsv);

      try {
        const prodCsv = `"PartNumber","ProductNumber","Active"\n"${partNumber}","${partNumber}","false"`;
        await this.importProduct(prodCsv);
      } catch (e) {}

      console.log(`[Fishbowl] Successfully deactivated "${partNumber}" in Fishbowl`);
    } catch (err) {
      console.error(`[Fishbowl Deactivate Warning] Failed to deactivate "${partNumber}":`, err.response?.data?.message || err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Customer Import
  // ─────────────────────────────────────────────────────────────
  async importCustomer(csvString) {
    return this.request('POST', '/api/import/Customers', csvString, {
      contentType: 'text/plain',
    });
  }

  async syncCustomer(customer) {
    if (!customer || !this.isConfigured()) return null;

    try {
      const clean = (val) => (val || '').replace(/"/g, '""').trim();
      const name = clean(customer.fullName || 'Valued Customer');
      const email = clean(customer.email);
      const street = clean(customer.billingStreet || customer.commercialStreet || '123 Main St');
      const city = clean(customer.billingCity || customer.commercialCity || 'City');
      const state = clean(customer.billingState || customer.commercialState || 'CA');
      const zip = clean(customer.billingZip || customer.commercialZip || '90001');
      const country = clean(customer.billingCountry || customer.commercialCountry || 'US');

      const custCSV = `"CustomerName","BillingAddress","BillingCity","BillingState","BillingZip","BillingCountry","Email"\n"${name}","${street}","${city}","${state}","${zip}","${country}","${email}"`;

      console.log(`[Fishbowl] Importing/verifying customer: ${name} (${email})`);
      await this.importCustomer(custCSV);

      return email;
    } catch (err) {
      console.error('[Fishbowl] Customer sync failed:', err.response?.data || err.message);
      return customer.email;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Sales Order (SO) Creation for WorldShip & FedEx Ship Manager
  // ─────────────────────────────────────────────────────────────
  async importSalesOrder(csvString) {
    return this.request('POST', '/api/import/Sales-Order', csvString, {
      contentType: 'text/plain',
    });
  }

  /**
   * Generates and imports a complete Sales Order into Fishbowl.
   * Includes Ship-To and Bill-To addresses so FedEx Ship Manager and UPS WorldShip
   * can automatically pull complete shipping data via ODBC.
   */
  async syncSalesOrder({ order, customer, items, shippingAddress = {}, billingAddress = {} }) {
    if (!this.isConfigured()) {
      console.log('[Fishbowl Notice] Fishbowl not configured. Skipping Sales Order creation.');
      return null;
    }

    try {
      console.log(`\n========== [FISHBOWL] Syncing Sales Order for Order #${order.id} ==========`);

      // Duplicate guard: never create a second Sales Order for the same website order
      const existing = await prisma.order.findUnique({
        where: { id: order.id },
        select: { fishbowlSalesOrderNumber: true },
      });
      if (existing?.fishbowlSalesOrderNumber) {
        console.log(`[Fishbowl] Order #${order.id} already synced as SO ${existing.fishbowlSalesOrderNumber}. Skipping.`);
        return existing.fishbowlSalesOrderNumber;
      }

      // 1. Ensure customer is synced
      let fbCustomerNum = customer.fishbowlCustomerNumber;
      if (!fbCustomerNum) {
        fbCustomerNum = await this.syncCustomer(customer);
        if (fbCustomerNum) {
          try {
            await prisma.customers.update({
              where: { id: customer.id },
              data: { fishbowlCustomerNumber: fbCustomerNum },
            });
          } catch (e) {}
        }
      }

      const clean = (val) => (val || '').replace(/"/g, '""').trim();
      const soNum = `#${order.id}`;
      const customerName = clean(customer.fullName || 'Valued Customer');
      const dateStr = (order.createdAt ? new Date(order.createdAt) : new Date()).toISOString().split('T')[0];

      // Billing info
      const billToName = clean(billingAddress.firstName ? `${billingAddress.firstName} ${billingAddress.lastName || ''}` : customer.fullName);
      const billToAddress = clean(billingAddress.address1 || customer.billingStreet || customer.commercialStreet || '');
      const billToCity = clean(billingAddress.city || customer.billingCity || customer.commercialCity || '');
      const billToState = clean(billingAddress.state || customer.billingState || customer.commercialState || '');
      const billToZip = clean(billingAddress.zip || customer.billingZip || customer.commercialZip || '');
      const billToCountry = clean(billingAddress.country || customer.billingCountry || customer.commercialCountry || 'US');

      // Shipping info (Crucial for WorldShip / FedEx Ship Manager ODBC)
      const shipToName = clean(shippingAddress.fullName || `${order.shipFirstName || ''} ${order.shipLastName || ''}`.trim() || customer.fullName);
      const shipToAddress = clean(shippingAddress.address1 || order.shipAddress1 || customer.commercialStreet || customer.billingStreet || '');
      const shipToCity = clean(shippingAddress.city || order.shipCity || customer.commercialCity || customer.billingCity || '');
      const shipToState = clean(shippingAddress.state || order.shipState || customer.commercialState || customer.billingState || '');
      const shipToZip = clean(shippingAddress.zip || order.shipZip || customer.commercialZip || customer.billingZip || '');
      const shipToCountry = clean(shippingAddress.country || order.shipCountry || customer.commercialCountry || customer.billingCountry || 'US');

      // Fishbowl Sales Order CSV format (Flag-based: "SO" for header, "Item" for items)
      const rows = [];

      // Carrier & Service detection: UPS or FedEx
      const svcRaw = String(shippingAddress.shippingServiceName || order.serviceLevel || order.shippingServiceName || '').trim();
      const carrierHint = String(shippingAddress.carrier || order.carrier || '').trim().toLowerCase();

      let isFedex = false;
      let isUPS = false;
      if (carrierHint.includes('fedex') || svcRaw.toLowerCase().includes('fedex')) {
        isFedex = true;
      } else if (carrierHint.includes('ups') || svcRaw.toLowerCase().includes('ups')) {
        isUPS = true;
      } else {
        // Default to FedEx Ground for domestic e-commerce orders
        isFedex = true;
      }

      let carrierName = 'Fedex';
      let carrierService = '';

      if (isUPS) {
        carrierName = 'UPS';
        if (svcRaw.toLowerCase().includes('next day early')) carrierService = 'Next Day Air Early A.M.';
        else if (svcRaw.toLowerCase().includes('next day saver')) carrierService = 'Next Day Air Saver';
        else if (svcRaw.toLowerCase().includes('next day')) carrierService = 'Next Day Air';
        else if (svcRaw.toLowerCase().includes('2nd day air a.m.') || svcRaw.toLowerCase().includes('2day am')) carrierService = '2nd Day Air A.M.';
        else if (svcRaw.toLowerCase().includes('2nd day') || svcRaw.toLowerCase().includes('2day')) carrierService = '2nd Day Air';
        else if (svcRaw.toLowerCase().includes('3 day') || svcRaw.toLowerCase().includes('3day')) carrierService = '3 Day Select';
        else carrierService = 'Ground';
      } else {
        // FedEx: In Fishbowl, carrier name is 'Fedex' (id 4) or 'Fedex Grnd' (id 25)
        if (svcRaw.toLowerCase().includes('ground')) {
          carrierName = 'Fedex Grnd';
          carrierService = 'Ground';
        } else if (svcRaw.toLowerCase().includes('2day')) {
          carrierName = 'Fedex';
          carrierService = '2Day';
        } else if (svcRaw.toLowerCase().includes('express saver')) {
          carrierName = 'Fedex';
          carrierService = 'Express Saver';
        } else if (svcRaw.toLowerCase().includes('priority overnight') || svcRaw.toLowerCase().includes('overnight')) {
          carrierName = 'Fedex';
          carrierService = 'Priority Overnight';
        } else {
          carrierName = 'Fedex';
          carrierService = svcRaw.replace(/®/g, '').replace(/FedEx\s*/i, '').trim() || 'Ground';
        }
      }

      // 1. Order Header Row (Flag: "SO")
      // Columns: Flag,SONum,Status,CustomerName,CustomerContact,BillToName,BillToAddress,BillToCity,BillToState,BillToZip,BillToCountry,ShipToName,ShipToAddress,ShipToCity,ShipToState,ShipToZip,ShipToCountry,ShipToResidential,CarrierName,CarrierService,CostCenter,PaymentTerms,FirstShipDate,CreatedDate,Salesman,CustomerPO
      rows.push(
        `"SO","${soNum}","20","${customerName}","","${billToName}","${billToAddress}","${billToCity}","${billToState}","${billToZip}","${billToCountry}","${shipToName}","${shipToAddress}","${shipToCity}","${shipToState}","${shipToZip}","${shipToCountry}","false","${clean(carrierName)}","${clean(carrierService)}","","CREDIT CARD","","${dateStr}","Stevep",""`
      );

      // 2. Line Item Rows (Flag: "Item")
      // Fishbowl format: Flag,SOItemTypeID,ProductNumber,ProductDescription,ProductQuantity,UOM,ProductPrice,Taxable
      // SOItemTypeID: 10 = Sale, 11 = Misc. Sale, 60 = Shipping
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: Number(item.id || item.productId) },
        });

        if (!product) continue;

        let partNumber = product.fishbowlPartNumber || product.sku;
        if (!partNumber) {
          // Auto-sync product if not yet in Fishbowl
          const syncRes = await this.syncProduct(product);
          partNumber = syncRes?.partNumber || `PART-${product.id}`;
          await prisma.product.update({
            where: { id: product.id },
            data: { fishbowlPartNumber: partNumber },
          });
        }

        const itemName = clean(product.name);
        const qty = item.qty || item.quantity || 1;
        const price = Number(item.price || item.priceAtOrder || product.regularPrice).toFixed(2);

        rows.push(
          `"Item","10","${clean(partNumber)}","${itemName}","${qty}","ea","${price}","false"`
        );
      }

      // 3. Shipping Charge Line Item (matches Fishbowl's standard 'Shipping' product)
      const shipmentCostNum = parseFloat(order.shipmentCost || 0);
      if (shipmentCostNum > 0) {
        const shipCost = shipmentCostNum.toFixed(2);
        // Default to 'Shipping' product (SOItemTypeID 60: Shipping) to match Fishbowl standard setup
        const shipProduct = clean(process.env.FISHBOWL_SHIPPING_PRODUCT || 'Shipping');
        const cleanSvcTitle = svcRaw ? svcRaw.replace(/®/g, '').trim() : '';
        const shipDesc = clean(`Shipping & Handling${cleanSvcTitle ? ` - ${cleanSvcTitle}` : ''}`);
        rows.push(
          `"Item","60","${shipProduct}","${shipDesc}","1","ea","${shipCost}","false"`
        );
      }

      if (rows.length <= 1) {
        console.warn('[Fishbowl] No line items found for order:', order.id);
        return null;
      }

      const soCSV = rows.join('\n');
      console.log(`[Fishbowl] Sending Sales Order CSV to Fishbowl:\n${soCSV}`);

      await this.importSalesOrder(soCSV);

      // Update Order record with Fishbowl SO number
      await prisma.order.update({
        where: { id: order.id },
        data: { fishbowlSalesOrderNumber: soNum },
      });

      console.log(`[Fishbowl] Sales Order ${soNum} successfully created in Fishbowl!`);

      // Attempt to record payment against the Sales Order so Fishbowl displays the PAID watermark
      const orderTotalAmt = parseFloat(order.totalAmount || order.totalPrice || 0);
      if (orderTotalAmt > 0) {
        await this.recordPayment({
          soNum,
          customerName,
          amount: orderTotalAmt,
          transactionId: order.transactionId || '',
          paymentMethod: 'CREDIT CARD',
        }).catch((payErr) => {
          console.warn(`[Fishbowl] Payment auto-record notice:`, payErr.message);
        });
      }

      console.log('========== [FISHBOWL] End ==========\n');
      return soNum;
    } catch (err) {
      console.error(`[Fishbowl Order Sync Failed for #${order.id}]:`, err.response?.data || err.message);
      // Non-fatal: does not block order completion
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3b. Customer Payment Recording (for PAID watermark stamp)
  // ─────────────────────────────────────────────────────────────
  async recordPayment({ soNum, customerName, amount, transactionId, paymentMethod = 'CREDIT CARD' }) {
    if (!this.isConfigured()) return;
    const clean = (val) => (val || '').replace(/"/g, '""').trim();
    const dateStr = new Date().toISOString().split('T')[0];
    const amtStr = Number(amount || 0).toFixed(2);

    try {
      // 1. Try REST API /api/payments
      await this.request('POST', '/api/payments', {
        soNum,
        amount: Number(amtStr),
        paymentMethod,
        referenceNum: transactionId || '',
        date: dateStr,
      });
      console.log(`[Fishbowl] Payment of $${amtStr} recorded for ${soNum} via REST API`);
      return;
    } catch (e1) {
      // 2. Fallback to Customer-Payment CSV import
      try {
        const csv = `"CustomerName","PaymentDate","PaymentMethod","Amount","ReferenceNum","SONum"\n"${clean(customerName)}","${dateStr}","${paymentMethod}","${amtStr}","${clean(transactionId)}","${clean(soNum)}"`;
        await this.request('POST', '/api/import/Customer-Payment', csv, { contentType: 'text/plain' });
        console.log(`[Fishbowl] Payment of $${amtStr} recorded for ${soNum} via CSV import`);
      } catch (e2) {
        console.warn(`[Fishbowl] Payment auto-record skipped (can be taken manually in FB):`, e2.response?.data || e2.message);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Test Connectivity Check
  // ─────────────────────────────────────────────────────────────
  async testConnection() {
    try {
      const token = await this.login();
      return {
        success: true,
        message: 'Successfully connected and authenticated with Fishbowl Server.',
        tokenReceived: Boolean(token),
      };
    } catch (err) {
      return {
        success: false,
        message: err.message,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Get Inventory Stock for Parts from Fishbowl
  //    Uses AVAILABLE quantity = On Hand − Allocated − Not Available
  //    (same as "Available" in Fishbowl Part → Inventory tab).
  //    /api/parts/inventory only returns On Hand, which ignores stock
  //    already allocated to open Sales Orders → overselling risk.
  // ─────────────────────────────────────────────────────────────
  async getInventoryForParts(partNumbers = []) {
    const result = new Map();
    const unique = [...new Set(partNumbers.filter(Boolean).map((p) => String(p).trim()))];
    if (!unique.length || !this.isConfigured()) return result;

    const CHUNK = 200;
    for (let i = 0; i < unique.length; i += CHUNK) {
      const chunk = unique.slice(i, i + CHUNK);
      const inList = chunk.map((p) => `'${p.replace(/'/g, "''")}'`).join(',');
      const sql =
        'SELECT p.num AS num, COALESCE(SUM(q.qtyOnHand),0) AS onHand, COALESCE(SUM(q.qtyAllocated),0) AS allocated, ' +
        'COALESCE(SUM(q.qtyNotAvailable),0) AS notAvailable ' +
        `FROM part p LEFT JOIN qtyinventorytotals q ON q.partId = p.id WHERE p.num IN (${inList}) GROUP BY p.num`;

      const rows = await this.request('GET', '/api/data-query', sql, { contentType: 'text/plain' });
      for (const row of rows || []) {
        const onHand = Number(row.onHand || 0);
        const allocated = Number(row.allocated || 0);
        const notAvailable = Number(row.notAvailable || 0);
        result.set(String(row.num).toUpperCase(), {
          onHand,
          allocated,
          notAvailable,
          available: Math.max(0, Math.floor(onHand - allocated - notAvailable)),
        });
      }
    }
    return result;
  }

  /**
   * Returns AVAILABLE quantity for a single part, or null if the part
   * does not exist in Fishbowl / Fishbowl is unreachable.
   */
  async getPartInventory(partNumber) {
    if (!partNumber || !this.isConfigured()) return null;
    try {
      const map = await this.getInventoryForParts([partNumber]);
      const inv = map.get(String(partNumber).trim().toUpperCase());
      return inv ? inv.available : null;
    } catch (err) {
      console.warn(`[Fishbowl Inventory Warning] Could not fetch stock for "${partNumber}":`, err.response?.data || err.message);
      return null;
    }
  }

  /**
   * Returns available inventory breakdown by warehouse location (NY vs. DR).
   */
  async getPartStockByLocation(partNumber) {
    if (!partNumber || !this.isConfigured()) return { ny: null, dr: null };
    try {
      const cleanNum = String(partNumber).trim();
      const sql =
        'SELECT p.num AS num, COALESCE(lg.name, "Default") AS locGroup, ' +
        'COALESCE(SUM(q.qtyOnHand),0) AS onHand, COALESCE(SUM(q.qtyAllocated),0) AS allocated, ' +
        'COALESCE(SUM(q.qtyNotAvailable),0) AS notAvailable ' +
        'FROM part p ' +
        'LEFT JOIN qtyinventorytotals q ON q.partId = p.id ' +
        'LEFT JOIN locationgroup lg ON lg.id = q.locationGroupId ' +
        `WHERE p.num = '${cleanNum.replace(/'/g, "''")}' ` +
        'GROUP BY p.num, lg.name';

      const rows = await this.request('GET', '/api/data-query', sql, { contentType: 'text/plain' });
      let nyAvailable = 0;
      let drAvailable = 0;
      let found = false;

      for (const r of rows || []) {
        found = true;
        const onHand = Number(r.onHand || 0);
        const allocated = Number(r.allocated || 0);
        const notAvailable = Number(r.notAvailable || 0);
        const avail = Math.max(0, Math.floor(onHand - allocated - notAvailable));

        const loc = String(r.locGroup || '').toUpperCase();
        if (loc.includes('DR') || loc.includes('DOMINICAN')) {
          drAvailable += avail;
        } else {
          nyAvailable += avail;
        }
      }

      return found ? { ny: nyAvailable, dr: drAvailable } : { ny: null, dr: null };
    } catch (err) {
      console.warn(`[Fishbowl] Location stock check failed for "${partNumber}":`, err.message);
      return { ny: null, dr: null };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Get Complete Part & Product Details for Admin Product Creation
  // ─────────────────────────────────────────────────────────────
  async getPartFullDetails(partNumber) {
    if (!partNumber || !this.isConfigured()) return null;
    try {
      const cleanNum = String(partNumber).trim();
      const sql =
        'SELECT p.num AS num, p.description AS description, p.details AS details, ' +
        'p.weight AS weight, p.len AS length, p.width AS width, p.height AS height, ' +
        'prod.price AS price, ' +
        'COALESCE(SUM(q.qtyOnHand),0) AS onHand, COALESCE(SUM(q.qtyAllocated),0) AS allocated, ' +
        'COALESCE(SUM(q.qtyNotAvailable),0) AS notAvailable ' +
        'FROM part p ' +
        'LEFT JOIN product prod ON prod.partId = p.id ' +
        'LEFT JOIN qtyinventorytotals q ON q.partId = p.id ' +
        `WHERE p.num = '${cleanNum.replace(/'/g, "''")}' ` +
        'GROUP BY p.num, p.description, p.details, p.weight, p.len, p.width, p.height, prod.price';

      const rows = await this.request('GET', '/api/data-query', sql, { contentType: 'text/plain' });
      if (!rows || !rows.length) {
        // Fallback to parts API if custom query returns empty
        const partRes = await this.request('GET', `/api/parts?number=${encodeURIComponent(cleanNum)}`);
        const item = partRes?.results?.[0];
        if (!item) return null;
        const availableStock = await this.getPartInventory(cleanNum);
        return {
          sku: item.number,
          name: item.description,
          description: item.description,
          regularPrice: 0,
          stock: availableStock ?? 0,
          weightLb: 0,
          lengthIn: 0,
          widthIn: 0,
          heightIn: 0,
        };
      }

      const row = rows[0];
      const onHand = Number(row.onHand || 0);
      const allocated = Number(row.allocated || 0);
      const notAvailable = Number(row.notAvailable || 0);
      const available = Math.max(0, Math.floor(onHand - allocated - notAvailable));

      return {
        sku: row.num,
        name: row.description || row.num,
        description: row.details || row.description || '',
        regularPrice: row.price ? Number(row.price) : 0,
        stock: available,
        onHand,
        allocated,
        weightLb: row.weight ? Number(row.weight) : 0,
        lengthIn: row.length ? Number(row.length) : 0,
        widthIn: row.width ? Number(row.width) : 0,
        heightIn: row.height ? Number(row.height) : 0,
      };
    } catch (err) {
      console.error(`[Fishbowl] Failed to fetch full details for "${partNumber}":`, err.message);
      return null;
    }
  }
}

module.exports = new FishbowlService();