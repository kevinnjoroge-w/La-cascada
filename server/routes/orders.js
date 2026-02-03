const express = require('express');
const router = express.Router();
const {
  getUserOrders,
  getOrder,
  trackOrder,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  addOrderReview,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.get('/track/:orderNumber', trackOrder);

// Protected routes - User
router.use(protect);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.post('/', validate(schemas.order), createOrder);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/review', addOrderReview);

// Admin routes
router.use(authorize('admin', 'staff'));
router.get('/all', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.get('/stats', getOrderStats);

module.exports = router;

