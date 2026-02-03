const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentHistory,
  getPayment,
  processRefund,
  getAllPayments,
  getPaymentStats,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes - User
router.use(protect);
router.post('/', processPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPayment);

// Admin routes
router.use(authorize('admin'));
router.get('/all', getAllPayments);
router.get('/stats', getPaymentStats);
router.post('/:id/refund', processRefund);

module.exports = router;

