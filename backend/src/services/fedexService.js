const axios = require('axios');

class FedExService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  getEnvironment() {
    const env = (process.env.FEDEX_ENVIRONMENT || 'production').toLowerCase();
    return env === 'production'
      ? 'https://apis.fedex.com'
      : 'https://apis-sandbox.fedex.com';
  }

  getShipperDetails() {
    return {
      accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '740980114',
      name: process.env.UPS_SHIPPER_NAME || 'Club Pro MFG',
      address: process.env.UPS_SHIPPER_ADDRESS || '10 Lucon Drive',
      city: process.env.UPS_SHIPPER_CITY || 'DEER PARK',
      state: process.env.UPS_SHIPPER_STATE || 'NY',
      zip: process.env.UPS_SHIPPER_ZIP || '11729',
      country: process.env.UPS_SHIPPER_COUNTRY || 'US',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 1. OAuth 2.0 Token Generation (with auto-caching)
  // ─────────────────────────────────────────────────────────────
  async getAccessToken() {
    const clientId = process.env.FEDEX_CLIENT_ID;
    const clientSecret = process.env.FEDEX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('FEDEX_CLIENT_ID or FEDEX_CLIENT_SECRET is missing in environment variables.');
    }

    // Return cached token if still valid (with 60-second buffer)
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.token;
    }

    const baseUrl = this.getEnvironment();

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const response = await axios.post(
        `${baseUrl}/oauth/token`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      this.token = response.data.access_token;
      const expiresInSeconds = response.data.expires_in || 3600;
      this.tokenExpiry = Date.now() + expiresInSeconds * 1000;

      console.log('[FedEx Service] Successfully acquired OAuth 2.0 access token');
      return this.token;
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || err.message;
      console.error('[FedEx Auth Error]:', msg);
      throw new Error(`FedEx OAuth failed: ${msg}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Fetch Live International Rating Quotes
  // ─────────────────────────────────────────────────────────────
  async getLiveRates({ toAddress, packages = [] }) {
    const shipper = this.getShipperDetails();
    const token = await this.getAccessToken();
    const baseUrl = this.getEnvironment();

    const fedexPackages = packages.map((pkg) => {
      const weight = Math.max(0.5, parseFloat(pkg.weight || 1));
      const length = Math.max(1, Math.round(parseFloat(pkg.length || 10)));
      const width = Math.max(1, Math.round(parseFloat(pkg.width || 10)));
      const height = Math.max(1, Math.round(parseFloat(pkg.height || 4)));

      return {
        weight: {
          units: 'LB',
          value: parseFloat(weight.toFixed(1)),
        },
        dimensions: {
          length,
          width,
          height,
          units: 'IN',
        },
      };
    });

    const destinationCountry = (toAddress.country || 'CA').trim().toUpperCase();

    const requestBody = {
      accountNumber: {
        value: shipper.accountNumber,
      },
      requestedShipment: {
        rateRequestType: ['ACCOUNT', 'LIST'],
        shipper: {
          address: {
            streetLines: [shipper.address],
            city: shipper.city,
            stateOrProvinceCode: shipper.state,
            postalCode: shipper.zip,
            countryCode: shipper.country,
          },
        },
        recipient: {
          address: {
            streetLines: [toAddress.address1 || '123 Main St'],
            city: toAddress.city || '',
            stateOrProvinceCode: toAddress.state || '',
            postalCode: toAddress.zip || '',
            countryCode: destinationCountry,
          },
        },
        packagingType: 'YOUR_PACKAGING',
        pickupType: 'USE_SCHEDULED_PICKUP',
        requestedPackageLineItems: fedexPackages,
      },
    };

    try {
      const res = await axios.post(
        `${baseUrl}/rate/v1/rates/quotes`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Customer-Transaction-Id': `clubpro-intl-${Date.now()}`,
          },
          timeout: 12000,
        }
      );

      const replyDetails = res.data?.output?.rateReplyDetails || [];
      if (replyDetails.length === 0) {
        throw new Error(`No international rate quotes returned from FedEx for ${destinationCountry}`);
      }

      const markupPercent = parseFloat(process.env.SHIPPING_MARKUP_PERCENT || '0');

      const parsedRates = [];
      for (const reply of replyDetails) {
        const serviceName = reply.serviceName || reply.serviceDescription?.names?.[0]?.value || reply.serviceType;
        const serviceCode = reply.serviceType;

        // Choose ACCOUNT rate first (discounted), fallback to LIST
        const ratedDetails = reply.ratedShipmentDetails || [];
        const accountRate = ratedDetails.find((r) => r.rateType === 'ACCOUNT') || ratedDetails[0];

        if (!accountRate) continue;

        const totalNet = accountRate.totalNetCharge ?? accountRate.totalNetFedExCharge ?? accountRate.totalBaseCharge;
        if (totalNet === undefined || totalNet === null) continue;

        let cost = parseFloat(totalNet);
        if (markupPercent > 0) {
          cost = cost * (1 + markupPercent / 100);
        }

        parsedRates.push({
          carrier: 'FedEx',
          serviceCode,
          serviceName,
          cost: Math.round(cost * 100) / 100,
          currency: accountRate.currency || 'USD',
          guaranteedDays: reply.commit?.daysInTransit || null,
        });
      }

      // Filter and sort by price ascending (cheapest international first)
      const validRates = parsedRates.filter((r) => r.cost > 0).sort((a, b) => a.cost - b.cost);

      if (validRates.length === 0) {
        throw new Error('FedEx returned rate replies but no valid pricing could be calculated');
      }

      return {
        success: true,
        rates: validRates,
        selectedRate: validRates[0], // Lowest cost international service
      };
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message;
      console.error('[FedEx Rate Error]:', errorMsg);
      throw new Error(`FedEx rating failed: ${errorMsg}`);
    }
  }
}

module.exports = new FedExService();
