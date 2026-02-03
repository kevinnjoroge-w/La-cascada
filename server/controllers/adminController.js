const User = require('../models/User');
const Room = require('../models/Room');
const Table = require('../models/Table');
const Garden = require('../models/Garden');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const MenuItem = require('../models/MenuItem');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // User counts
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Today's bookings
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Today's orders
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    // Pending bookings
    const pendingBookings = await Booking.countDocuments({
      status: 'pending',
    });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .lean();

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users: userCounts,
        todayBookings,
        todayOrders,
        pendingBookings,
        recentOrders,
        recentBookings,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/admin/sales/daily
// @access  Private/Admin
exports.getDailySales = async (req, res) => {
  try {
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Orders by hour
    const ordersByHour = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sales by order type
    const salesByType = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: '$orderType',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    // Total for the day
    const dailyTotal = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        ordersByHour,
        salesByType,
        summary: dailyTotal[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      },
    });
  } catch (error) {
    console.error('Get daily sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data',
    });
  }
};

// @desc    Get monthly sales
// @route   GET /api/admin/sales/monthly
// @access  Private/Admin
exports.getMonthlySales = async (req, res) => {
  try {
    const { year, month } = req.query;

    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Daily breakdown
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly summary
    const monthlySummary = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: `${targetYear}-${targetMonth.toString().padStart(2, '0')}`,
        dailySales,
        summary: monthlySummary[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      },
    });
  } catch (error) {
    console.error('Get monthly sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly sales',
    });
  }
};

// @desc    Get popular items
// @route   GET /api/admin/popular-items
// @access  Private/Admin
exports.getPopularItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item',
        },
      },
      { $unwind: '$item' },
      {
        $project: {
          name: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          category: '$item.category',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: popularItems,
    });
  } catch (error) {
    console.error('Get popular items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular items',
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    let groupFormat;
    switch (groupBy) {
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const revenueByPeriod = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: 'success',
        },
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
          netRevenue: { $sum: { $subtract: ['$amount', '$refundAmount'] } },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Booking vs Order revenue
    const revenueByType = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: 'success',
        },
      },
      {
        $group: {
          _id: '$paymentType',
          revenue: { $sum: '$amount' },
          refunds: { $sum: '$refundAmount' },
          netRevenue: { $sum: { $subtract: ['$amount', '$refundAmount'] } },
        },
      },
    ]);

    const summary = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: 'success',
        },
      },
      {
        $group: {
          _id: null,
          grossRevenue: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
          netRevenue: { $sum: { $subtract: ['$amount', '$refundAmount'] } },
          avgTransaction: { $avg: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenueByPeriod,
        revenueByType,
        summary: summary[0] || {
          grossRevenue: 0,
          totalRefunds: 0,
          netRevenue: 0,
          avgTransaction: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
    });
  }
};

// @desc    Get booking analytics
// @route   GET /api/admin/booking-analytics
// @access  Private/Admin
exports.getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // By type
    const byType = await Booking.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$bookingType',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          avgValue: { $avg: '$pricing.totalAmount' },
        },
      },
    ]);

    // By status
    const byStatus = await Booking.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly trend
    const monthlyTrend = await Booking.aggregate([
      {
        $match: {
          ...dateQuery,
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const summary = await Booking.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' },
          avgBookingValue: { $avg: '$pricing.totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType,
        byStatus,
        monthlyTrend,
        summary: summary[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 },
      },
    });
  } catch (error) {
    console.error('Get booking analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking analytics',
    });
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let reportData;

    switch (reportType) {
      case 'orders':
        reportData = await Order.find(dateQuery)
          .populate('user', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .lean();
        break;

      case 'bookings':
        reportData = await Booking.find(dateQuery)
          .populate('user', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .lean();
        break;

      case 'payments':
        reportData = await Payment.find(dateQuery)
          .populate('user', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .lean();
        break;

      case 'users':
        reportData = await User.find(dateQuery)
          .select('-password')
          .sort({ createdAt: -1 })
          .lean();
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type',
        });
    }

    res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
    });
  }
};

// @desc    Get overview stats
// @route   GET /api/admin/stats/overview
// @access  Private/Admin
exports.getOverviewStats = async (req, res) => {
  try {
    const today = new Date();

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
    });

    // Room stats
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });

    // Order stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Booking stats
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overview stats',
    });
  }
};

