const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getDailySales,
  getMonthlySales,
  getPopularItems,
  getRevenueAnalytics,
  getBookingAnalytics,
  getReports,
  getOverviewStats,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/stats/overview', getOverviewStats);
router.get('/sales/daily', getDailySales);
router.get('/sales/monthly', getMonthlySales);
router.get('/popular-items', getPopularItems);
router.get('/revenue', getRevenueAnalytics);
router.get('/bookings', getBookingAnalytics);
router.get('/reports', getReports);

module.exports = router;

