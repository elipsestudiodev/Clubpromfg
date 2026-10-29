const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  carrierMode: 'FEDEX', // 'FEDEX' | 'UPS' | 'CHEAPEST'
  markupPercent: 0,
  handlingFee: 0.00,
  nyOrigin: {
    name: 'Club Pro MFG (NY Warehouse)',
    address: '10 Lucon Drive',
    city: 'DEER PARK',
    state: 'NY',
    zip: '11729',
    country: 'US',
    priority: 1,
    active: true,
  },
  drOrigin: {
    name: 'Club Pro MFG (DR Warehouse)',
    address: 'Parque Industrial Zona Franca',
    city: 'Santiago',
    state: 'Santiago',
    zip: '51000',
    country: 'DO',
    priority: 2,
    active: true,
  },
  boxVariants: [
    {
      id: 'box-variant-1',
      name: 'Master Box 48x12x12',
      length: 48,
      width: 12,
      height: 12,
      maxWeight: 70,
      description: 'Fits up to 4 Shark Fin / 47x11x4 boxes',
    },
    {
      id: 'box-variant-2',
      name: 'Master Box 29x22x12',
      length: 29,
      width: 22,
      height: 12,
      maxWeight: 60,
      description: 'Fits up to 4 Hoodies & 3x4 boxes (21x2x27)',
    },
    {
      id: 'box-variant-3',
      name: 'Master Box 48x12x8',
      length: 48,
      width: 12,
      height: 8,
      maxWeight: 65,
      description: 'Fits CarryAll, Umax, 3-sided 2-passenger (Yamaha & EZ-GO)',
    },
    {
      id: 'box-standard',
      name: 'Standard Accessory Box',
      length: 12,
      width: 10,
      height: 6,
      maxWeight: 20,
      description: 'Fits sand bottles, coolers, cleats, caps, and small accessories',
    },
  ],
};

let cachedSettings = null;
let cacheExpiry = 0;
let tableReady = false;

class ShippingSettingsService {
  async _ensureTable() {
    if (tableReady) return;
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS shipping_settings (
          id INT PRIMARY KEY,
          carrier_mode VARCHAR(50) NOT NULL DEFAULT 'FEDEX',
          markup_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          handling_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          ny_origin JSON NULL,
          dr_origin JSON NULL,
          box_variants JSON NULL,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      tableReady = true;
    } catch (err) {
      console.warn('[ShippingSettings] Could not ensure table exists:', err.message);
    }
  }

  async getSettings() {
    if (cachedSettings && Date.now() < cacheExpiry) {
      return cachedSettings;
    }

    await this._ensureTable();

    try {
      const rows = await prisma.$queryRawUnsafe(
        'SELECT * FROM shipping_settings WHERE id = 1'
      );

      if (rows && rows.length > 0) {
        const row = rows[0];
        const parseJson = (val, fallback) => {
          if (!val) return fallback;
          if (typeof val === 'object') return val;
          try {
            return JSON.parse(val);
          } catch {
            return fallback;
          }
        };

        cachedSettings = {
          carrierMode: row.carrier_mode || 'FEDEX',
          markupPercent: parseFloat(row.markup_percent || 0),
          handlingFee: parseFloat(row.handling_fee || 0),
          nyOrigin: parseJson(row.ny_origin, DEFAULT_SETTINGS.nyOrigin),
          drOrigin: parseJson(row.dr_origin, DEFAULT_SETTINGS.drOrigin),
          boxVariants: parseJson(row.box_variants, DEFAULT_SETTINGS.boxVariants),
        };
      } else {
        // Insert defaults
        await prisma.$executeRawUnsafe(
          `INSERT INTO shipping_settings (id, carrier_mode, markup_percent, handling_fee, ny_origin, dr_origin, box_variants)
           VALUES (1, ?, ?, ?, ?, ?, ?)`,
          DEFAULT_SETTINGS.carrierMode,
          DEFAULT_SETTINGS.markupPercent,
          DEFAULT_SETTINGS.handlingFee,
          JSON.stringify(DEFAULT_SETTINGS.nyOrigin),
          JSON.stringify(DEFAULT_SETTINGS.drOrigin),
          JSON.stringify(DEFAULT_SETTINGS.boxVariants)
        );
        cachedSettings = { ...DEFAULT_SETTINGS };
      }
    } catch (err) {
      console.warn('[ShippingSettings] Failed to fetch settings from DB, using defaults:', err.message);
      cachedSettings = { ...DEFAULT_SETTINGS };
    }

    cacheExpiry = Date.now() + 15000; // 15 second memory cache
    return cachedSettings;
  }

  async updateSettings(updates = {}) {
    await this._ensureTable();
    const current = await this.getSettings();

    const carrierMode = updates.carrierMode || current.carrierMode;
    const markupPercent = updates.markupPercent !== undefined ? parseFloat(updates.markupPercent) : current.markupPercent;
    const handlingFee = updates.handlingFee !== undefined ? parseFloat(updates.handlingFee) : current.handlingFee;
    const nyOrigin = updates.nyOrigin ? { ...current.nyOrigin, ...updates.nyOrigin } : current.nyOrigin;
    const drOrigin = updates.drOrigin ? { ...current.drOrigin, ...updates.drOrigin } : current.drOrigin;
    const boxVariants = updates.boxVariants || current.boxVariants;

    await prisma.$executeRawUnsafe(
      `INSERT INTO shipping_settings (id, carrier_mode, markup_percent, handling_fee, ny_origin, dr_origin, box_variants)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         carrier_mode = VALUES(carrier_mode),
         markup_percent = VALUES(markup_percent),
         handling_fee = VALUES(handling_fee),
         ny_origin = VALUES(ny_origin),
         dr_origin = VALUES(dr_origin),
         box_variants = VALUES(box_variants)`,
      carrierMode,
      markupPercent,
      handlingFee,
      JSON.stringify(nyOrigin),
      JSON.stringify(drOrigin),
      JSON.stringify(boxVariants)
    );

    cachedSettings = {
      carrierMode,
      markupPercent,
      handlingFee,
      nyOrigin,
      drOrigin,
      boxVariants,
    };
    cacheExpiry = Date.now() + 60000;

    return cachedSettings;
  }
}

module.exports = new ShippingSettingsService();
