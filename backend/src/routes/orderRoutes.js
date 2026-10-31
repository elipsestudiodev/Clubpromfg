// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const {
  stripeWebhook,
  stripeSession,
  getOrders,
  getOrderById,
  updateStatus,
  bulkCancel,
  updateOrderTracking,
  getMyOrders,
  syncFishbowlOrders,
} = require("../controllers/orderController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Customer: Get personal order history & tracking
router.get('/orders/my-orders', authenticateToken, getMyOrders);
router.get('/my-orders', authenticateToken, getMyOrders);

// Fishbowl Shipment Sync
router.get('/orders/sync-fishbowl', syncFishbowlOrders);
router.post('/orders/sync-fishbowl', syncFishbowlOrders);

router.get('/orders', getOrders);

// Get single order with relations
router.get('/orders/:id',  getOrderById);

// Update status
router.patch('/orders/:id/status',  updateStatus);

// Bulk cancel
router.post('/orders/bulk-cancel',  bulkCancel);

// Tracking update webhook (called by Fishbowl or Admin to mark Shipped & email customer)
router.post('/orders/webhook/tracking', updateOrderTracking);
router.patch('/orders/:id/tracking', updateOrderTracking);
router.post('/orders/:id/tracking', updateOrderTracking);


module.exports = router;
