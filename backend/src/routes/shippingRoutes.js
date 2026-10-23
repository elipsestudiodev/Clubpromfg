const express = require('express');
const router = express.Router();
const {
  calculateRate,
  getActiveCountries,
  getAllCountries,
  createCountry,
  updateCountry,
  deleteCountry,
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

module.exports = router;
