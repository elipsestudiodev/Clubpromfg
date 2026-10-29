const { PrismaClient } = require('@prisma/client');
const upsService = require('./upsService');
const fedexService = require('./fedexService');
const shippingSettings = require('./shippingSettingsService');
const fishbowl = require('./fishbowlService');

const prisma = new PrismaClient();

class ShippingService {
  /**
   * Helper: Smart Box Packing & Multi-Item Consolidation
   * Uses client master box variants (48x12x12, 29x22x12, 48x12x8)
   * Consolidates accessories (e.g. Sand Bottle, Cooler, Cleats) inside Enclosure boxes.
   */
  async buildPackages(items = [], boxVariants = []) {
    const productIds = items
      .map((item) => Number(item.id || item.productId))
      .filter((id) => !isNaN(id) && id > 0);

    let dbProducts = [];
    if (productIds.length > 0) {
      try {
        dbProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            sku: true,
            name: true,
            weightLb: true,
            lengthIn: true,
            widthIn: true,
            heightIn: true,
            fishbowlPartNumber: true,
          },
        });
      } catch (err) {
        console.warn('[Shipping Service] Could not fetch products from DB:', err.message);
      }
    }

    // Classify items into Enclosures (requiring master boxes) vs Accessories (nestable)
    const enclosures = [];
    const accessories = [];

    for (const item of items) {
      const pId = Number(item.id || item.productId);
      const prod = dbProducts.find((p) => p.id === pId);
      const qty = Math.max(1, Number(item.qty || item.quantity || 1));
      const name = (prod?.name || item.name || '').toLowerCase();
      const sku = (prod?.sku || item.sku || '').toLowerCase();

      const weight = parseFloat(item.weightLb || prod?.weightLb || 2.0);
      const length = parseFloat(item.lengthIn || prod?.lengthIn || 12.0);
      const width = parseFloat(item.widthIn || prod?.widthIn || 10.0);
      const height = parseFloat(item.heightIn || prod?.heightIn || 4.0);

      const isEnclosure =
        name.includes('enclosure') ||
        name.includes('hoodie') ||
        name.includes('cabana') ||
        name.includes('cover') ||
        sku.startsWith('bc') ||
        sku.startsWith('cab');

      const entry = {
        id: pId,
        sku: prod?.sku || item.sku,
        name: prod?.name || item.name,
        qty,
        weight,
        length,
        width,
        height,
      };

      if (isEnclosure) {
        enclosures.push(entry);
      } else {
        accessories.push(entry);
      }
    }

    const packages = [];

    // Master box variants defaults
    const masterBoxes = boxVariants.length > 0 ? boxVariants : [
      { id: 'box-variant-1', name: 'Master Box 48x12x12', length: 48, width: 12, height: 12, maxUnits: 4, maxWeight: 70 },
      { id: 'box-variant-2', name: 'Master Box 29x22x12', length: 29, width: 22, height: 12, maxUnits: 4, maxWeight: 60 },
      { id: 'box-variant-3', name: 'Master Box 48x12x8',  length: 48, width: 12, height: 8,  maxUnits: 2, maxWeight: 65 },
    ];

    // Pack Enclosures into Master Box Variants
    for (const enc of enclosures) {
      let remainingQty = enc.qty;
      const lowerName = (enc.name || '').toLowerCase();
      const lowerSku = (enc.sku || '').toLowerCase();

      // Determine appropriate master box for this enclosure type
      let chosenBox = masterBoxes[1]; // Default: 29x22x12 (Hoodies, 3x4s)

      if (lowerName.includes('shark') || lowerSku.includes('shark')) {
        chosenBox = masterBoxes[0] || chosenBox; // 48x12x12
      } else if (
        lowerName.includes('carryall') ||
        lowerName.includes('umax') ||
        lowerName.includes('3-sided') ||
        lowerName.includes('3 sided') ||
        lowerSku.includes('ca502') ||
        lowerSku.includes('umax')
      ) {
        chosenBox = masterBoxes[2] || chosenBox; // 48x12x8
      }

      const capacity = chosenBox.maxUnits || 4;

      while (remainingQty > 0) {
        const unitsInThisBox = Math.min(capacity, remainingQty);
        const boxWeight = parseFloat((enc.weight * unitsInThisBox).toFixed(2));

        packages.push({
          boxName: chosenBox.name || 'Master Enclosure Box',
          length: chosenBox.length,
          width: chosenBox.width,
          height: chosenBox.height,
          weight: Math.max(1, boxWeight),
          capacityLeft: capacity - unitsInThisBox,
          itemsPacked: [`${enc.name} (x${unitsInThisBox})`],
        });

        remainingQty -= unitsInThisBox;
      }
    }

    // Consolidate accessories: nest inside existing enclosure master boxes first!
    let unnestedAccessoriesWeight = 0;
    const unnestedNames = [];

    for (const acc of accessories) {
      let accQty = acc.qty;
      const accUnitWeight = acc.weight;

      // Try to nest inside existing enclosure packages
      for (const pkg of packages) {
        if (accQty <= 0) break;
        // Nest accessory into this box (increases weight without adding second box!)
        const addWeight = parseFloat((accQty * accUnitWeight).toFixed(2));
        pkg.weight = parseFloat((pkg.weight + addWeight).toFixed(2));
        pkg.itemsPacked.push(`${acc.name} (x${accQty} nested)`);
        accQty = 0;
      }

      if (accQty > 0) {
        unnestedAccessoriesWeight += accQty * accUnitWeight;
        unnestedNames.push(`${acc.name} (x${accQty})`);
      }
    }

    // If there were no enclosures to nest into, pack accessories into a Standard Box
    if (unnestedAccessoriesWeight > 0) {
      packages.push({
        boxName: 'Standard Accessory Box',
        length: 12,
        width: 10,
        height: 6,
        weight: Math.max(1, parseFloat(unnestedAccessoriesWeight.toFixed(2))),
        itemsPacked: unnestedNames,
      });
    }

    // Safety fallback: if no packages built
    if (packages.length === 0) {
      packages.push({
        boxName: 'Standard Parcel',
        length: 12,
        width: 10,
        height: 6,
        weight: 2,
        itemsPacked: ['Cart Items'],
      });
    }

    return packages;
  }

  /**
   * Domestic fallback rate if carrier API is unreachable
   */
  calculateDomesticFallback(packages) {
    const totalWeight = packages.reduce((sum, p) => sum + p.weight, 0);
    const baseRate = parseFloat(process.env.DEFAULT_SHIPPING_BASE_RATE || '15.00');
    const perLb = parseFloat(process.env.DEFAULT_SHIPPING_PER_LB || '1.25');
    const cost = Math.max(baseRate, baseRate + Math.max(0, totalWeight - 1) * perLb);
    return Math.round(cost * 100) / 100;
  }

  /**
   * International fallback rate if carrier API is unreachable
   */
  calculateInternationalRate(packages) {
    const totalWeight = packages.reduce((sum, p) => sum + p.weight, 0);
    const baseRate = parseFloat(process.env.INTERNATIONAL_BASE_RATE || '39.00');
    const perLb = parseFloat(process.env.INTERNATIONAL_PER_LB || '3.50');
    const cost = baseRate + Math.max(0, totalWeight - 1) * perLb;
    return Math.round(cost * 100) / 100;
  }

  /**
   * Multi-Origin Inventory Split Resolution:
   * Checks Fishbowl for each item's stock location (NY vs. DR).
   * NY has priority 1; DR is priority 2.
   */
  async resolveOrigins(items = [], settings) {
    const nyItems = [];
    const drItems = [];

    for (const item of items) {
      const partNumber = item.fishbowlPartNumber || item.sku;
      if (fishbowl.isConfigured() && partNumber) {
        try {
          const locStock = await fishbowl.getPartStockByLocation(partNumber);
          // NY has priority
          if (locStock.ny !== null && locStock.ny > 0) {
            nyItems.push(item);
          } else if (locStock.dr !== null && locStock.dr > 0) {
            drItems.push(item);
          } else {
            // Default to NY primary warehouse
            nyItems.push(item);
          }
        } catch {
          nyItems.push(item);
        }
      } else {
        nyItems.push(item);
      }
    }

    const legs = [];
    if (nyItems.length > 0) {
      legs.push({
        originName: settings.nyOrigin.name,
        fromAddress: settings.nyOrigin,
        items: nyItems,
      });
    }
    if (drItems.length > 0) {
      legs.push({
        originName: settings.drOrigin.name,
        fromAddress: settings.drOrigin,
        items: drItems,
      });
    }

    return legs.length > 0
      ? legs
      : [{ originName: settings.nyOrigin.name, fromAddress: settings.nyOrigin, items }];
  }

  /**
   * Unified Rate Calculator:
   * - Evaluates Carrier Mode ('FEDEX', 'UPS', 'CHEAPEST' rate shopping)
   * - Solves Multi-Origin split shipments (NY vs. DR)
   * - Packs into client's master box variants & consolidates accessories
   * - Applies dynamic markup % & handling fees
   */
  async calculateRate({ items = [], shippingAddress = {} }) {
    const settings = await shippingSettings.getSettings();
    const destinationCountry = (shippingAddress.country || 'US').trim().toUpperCase();
    const isDomestic = destinationCountry === 'US' || destinationCountry === 'USA';

    // 1. Resolve multi-location fulfillment (NY vs. DR)
    const originLegs = await this.resolveOrigins(items, settings);

    let totalRawShipping = 0;
    let selectedCarrier = settings.carrierMode === 'UPS' ? 'UPS' : 'FedEx';
    let selectedServiceName = '';
    const allParcels = [];
    const legDetails = [];
    let rateShoppingComparison = null;

    for (const leg of originLegs) {
      const packages = await this.buildPackages(leg.items, settings.boxVariants);
      allParcels.push(...packages);

      let legCost = 0;
      let legService = '';
      let legCarrier = selectedCarrier;

      // Rate Shopping Logic: FEDEX | UPS | CHEAPEST
      if (settings.carrierMode === 'CHEAPEST') {
        // Query BOTH carriers in parallel!
        const [fedexRes, upsRes] = await Promise.allSettled([
          fedexService.getLiveRates({
            toAddress: shippingAddress,
            packages,
            fromAddress: leg.fromAddress,
          }),
          upsService.getLiveRates({
            toAddress: shippingAddress,
            packages,
            fromAddress: leg.fromAddress,
          }),
        ]);

        const fedexRate = fedexRes.status === 'fulfilled' ? fedexRes.value?.selectedRate : null;
        const upsRate = upsRes.status === 'fulfilled' ? upsRes.value?.selectedRate : null;

        if (fedexRate && upsRate) {
          rateShoppingComparison = {
            fedex: { cost: fedexRate.cost, service: fedexRate.serviceName },
            ups: { cost: upsRate.cost, service: upsRate.serviceName },
          };

          if (fedexRate.cost <= upsRate.cost) {
            legCarrier = 'FedEx';
            legCost = fedexRate.cost;
            legService = fedexRate.serviceName;
          } else {
            legCarrier = 'UPS';
            legCost = upsRate.cost;
            legService = upsRate.serviceName;
          }
        } else if (fedexRate) {
          legCarrier = 'FedEx';
          legCost = fedexRate.cost;
          legService = fedexRate.serviceName;
        } else if (upsRate) {
          legCarrier = 'UPS';
          legCost = upsRate.cost;
          legService = upsRate.serviceName;
        } else {
          // Fallback
          legCarrier = isDomestic ? 'FedEx' : 'FedEx';
          legCost = isDomestic
            ? this.calculateDomesticFallback(packages)
            : this.calculateInternationalRate(packages);
          legService = 'Ground Delivery (Calculated Rate)';
        }
      } else if (settings.carrierMode === 'UPS') {
        // UPS Preferred
        try {
          const upsRes = await upsService.getLiveRates({
            toAddress: shippingAddress,
            packages,
            fromAddress: leg.fromAddress,
          });
          if (upsRes.selectedRate) {
            legCarrier = 'UPS';
            legCost = upsRes.selectedRate.cost;
            legService = upsRes.selectedRate.serviceName;
          }
        } catch (e) {
          console.warn('[Shipping] UPS live lookup failed, fallback:', e.message);
          legCost = isDomestic
            ? this.calculateDomesticFallback(packages)
            : this.calculateInternationalRate(packages);
          legService = 'UPS Ground (Fallback)';
        }
      } else {
        // Default: FEDEX Preferred (Client's choice for better negotiated rates)
        try {
          const fedexRes = await fedexService.getLiveRates({
            toAddress: shippingAddress,
            packages,
            fromAddress: leg.fromAddress,
          });
          if (fedexRes.selectedRate) {
            legCarrier = 'FedEx';
            legCost = fedexRes.selectedRate.cost;
            legService = fedexRes.selectedRate.serviceName;
          }
        } catch (e) {
          console.warn('[Shipping] FedEx live lookup failed, fallback:', e.message);
          legCost = isDomestic
            ? this.calculateDomesticFallback(packages)
            : this.calculateInternationalRate(packages);
          legService = isDomestic ? 'FedEx Ground (Fallback)' : 'FedEx International (Fallback)';
        }
      }

      totalRawShipping += legCost;
      selectedCarrier = legCarrier;
      selectedServiceName = legService;

      legDetails.push({
        origin: leg.originName,
        carrier: legCarrier,
        service: legService,
        cost: legCost,
        packagesCount: packages.length,
      });
    }

    // 4. Apply dynamic markup % & handling fee
    const markupMultiplier = 1 + (settings.markupPercent || 0) / 100;
    const markedUpCost = totalRawShipping * markupMultiplier;
    const finalTotalShipping = parseFloat(
      (markedUpCost + (settings.handlingFee || 0)).toFixed(2)
    );

    return {
      success: true,
      cost: finalTotalShipping,
      carrier: selectedCarrier,
      serviceName: selectedServiceName || `${selectedCarrier} Delivery`,
      isInternational: !isDomestic,
      markupPercentApplied: settings.markupPercent,
      handlingFeeApplied: settings.handlingFee,
      packages: allParcels,
      originLegs: legDetails,
      rateShoppingComparison,
    };
  }
}

module.exports = new ShippingService();
