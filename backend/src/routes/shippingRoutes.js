const express = require('express');
const router = express.Router();
const {
  calculateRate,
  getActiveCountries,
  getAllCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  getShippingSettings,
  updateShippingSettings,
} = require('../controllers/shippingController');

// Rate calculation (public, called during checkout)
router.post('/calculate-rate', calculateRate);

// Public country list for checkout dropdown
router.get('/countries', getActiveCountries);

// Admin country management
router.get('/admin/countries', getAllCountries);
router.post('/admin/countries', createCountry);
router.put('/admin/countries/:id', updateCountry);
router.delete('/admin/countries/:id', deleteCountry);

// Admin Shipping Engine & Logistics Settings (Carrier Mode, Markups, Origins, Box Variants)
router.get('/admin/settings', getShippingSettings);
router.put('/admin/settings', updateShippingSettings);

module.exports = router;
