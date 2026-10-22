const express = require('express');
const {
  getProductTypes,
  getProductType,
  createProductType,
  updateProductType,
  deleteProductType,
  bulkDeleteProductTypes,
  allProductType
} = require('../controllers/productTypeController');

const router = express.Router();

// Product Type routes
router.get('/product-types', getProductTypes);
router.get('/all-product-types', allProductType);
router.get('/product-types/:id', getProductType);
router.post('/product-types', createProductType);
router.put('/product-types/:id', updateProductType);
router.delete('/product-types/:id', deleteProductType);
router.post('/bulk-delete-product-types', bulkDeleteProductTypes);

module.exports = router;
