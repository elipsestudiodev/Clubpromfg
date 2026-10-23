const { PrismaClient } = require('@prisma/client');
const shippingService = require('../services/shippingService');

const prisma = new PrismaClient();

const DEFAULT_COUNTRIES = [
  { id: 1, code: 'US', name: 'United States', carrier: 'UPS', isActive: true, sortOrder: 1 },
  { id: 2, code: 'CA', name: 'Canada', carrier: 'FedEx', isActive: true, sortOrder: 2 },
  { id: 3, code: 'GB', name: 'United Kingdom', carrier: 'FedEx', isActive: true, sortOrder: 3 },
  { id: 4, code: 'AU', name: 'Australia', carrier: 'FedEx', isActive: true, sortOrder: 4 },
  { id: 5, code: 'DE', name: 'Germany', carrier: 'FedEx', isActive: true, sortOrder: 5 },
  { id: 6, code: 'MX', name: 'Mexico', carrier: 'FedEx', isActive: true, sortOrder: 6 },
];

/**
 * POST /api/shipping/calculate-rate
 * Body: { items: [{ id, qty }], shippingAddress: { zip, state, city, address1, country } }
 */
exports.calculateRate = async (req, res) => {
  try {
    const { items = [], shippingAddress = {} } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required to calculate shipping.',
      });
    }

    const rateResult = await shippingService.calculateRate({
      items,
      shippingAddress,
    });

    return res.status(200).json({
      success: true,
      shippingCost: rateResult.cost,
      carrier: rateResult.carrier,
      serviceName: rateResult.serviceName,
      isInternational: rateResult.isInternational,
      parcel: rateResult.parcel,
      rates: rateResult.rates || [],
    });
  } catch (err) {
    console.error('[Shipping Controller] Error calculating rate:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping rate.',
      error: err.message,
    });
  }
};

/**
 * GET /api/shipping/countries
 * Public endpoint for frontend checkout dropdown (returns active countries)
 */
exports.getActiveCountries = async (req, res) => {
  try {
    let countries = [];
    try {
      countries = await prisma.shippingCountry.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (dbErr) {
      console.warn('[Shipping Controller] Failed to fetch countries from DB, using defaults:', dbErr.message);
    }

    if (!countries || countries.length === 0) {
      countries = DEFAULT_COUNTRIES;
    }

    return res.status(200).json({
      success: true,
      countries,
    });
  } catch (err) {
    console.error('[Shipping Controller] Error fetching active countries:', err);
    return res.status(200).json({
      success: true,
      countries: DEFAULT_COUNTRIES,
    });
  }
};

/**
 * GET /api/shipping/admin/countries
 * Admin endpoint to list all countries (active & inactive)
 */
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await prisma.shippingCountry.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return res.status(200).json({
      success: true,
      countries,
    });
  } catch (err) {
    console.error('[Shipping Controller] Error fetching all countries for admin:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch countries.',
      error: err.message,
    });
  }
};

/**
 * POST /api/shipping/admin/countries
 * Admin endpoint to create a country
 */
exports.createCountry = async (req, res) => {
  try {
    const { code, name, carrier = 'FedEx', isActive = true, sortOrder = 0 } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Country code and name are required.',
      });
    }

    const upperCode = code.trim().toUpperCase();

    const existing = await prisma.shippingCountry.findUnique({
      where: { code: upperCode },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Country with code "${upperCode}" already exists.`,
      });
    }

    const newCountry = await prisma.shippingCountry.create({
      data: {
        code: upperCode,
        name: name.trim(),
        carrier: carrier.trim() || (upperCode === 'US' ? 'UPS' : 'FedEx'),
        isActive: Boolean(isActive),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return res.status(201).json({
      success: true,
      country: newCountry,
      message: 'Country added successfully.',
    });
  } catch (err) {
    console.error('[Shipping Controller] Error creating country:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create country.',
      error: err.message,
    });
  }
};

/**
 * PUT /api/shipping/admin/countries/:id
 * Admin endpoint to update a country
 */
exports.updateCountry = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { code, name, carrier, isActive, sortOrder } = req.body;

    const existing = await prisma.shippingCountry.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Country not found.',
      });
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (name !== undefined) updateData.name = name.trim();
    if (carrier !== undefined) updateData.carrier = carrier.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const updatedCountry = await prisma.shippingCountry.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      country: updatedCountry,
      message: 'Country updated successfully.',
    });
  } catch (err) {
    console.error('[Shipping Controller] Error updating country:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update country.',
      error: err.message,
    });
  }
};

/**
 * DELETE /api/shipping/admin/countries/:id
 * Admin endpoint to delete a country
 */
exports.deleteCountry = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const existing = await prisma.shippingCountry.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Country not found.',
      });
    }

    await prisma.shippingCountry.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Country deleted successfully.',
    });
  } catch (err) {
    console.error('[Shipping Controller] Error deleting country:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete country.',
      error: err.message,
    });
  }
};
