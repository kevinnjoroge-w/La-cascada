const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Booking = require('../models/Booking');

// @desc    Process payment
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const { paymentType, orderId, bookingId, amount, paymentMethod } = req.body;

    // Validate payment type
    if (!['order', 'booking'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type',
      });
    }

    // Verify the order or booking exists and belongs to user
    if (paymentType === 'order') {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
      if (order.totalAmount !== amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch',
        });
      }
    } else if (paymentType === 'booking') {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
        });
      }
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized',
        });
      }
      if (booking.pricing.totalAmount !== amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch',
        });
      }
    }

    // Create payment record
    const payment = await Payment.create({
      paymentType,
      order: orderId || null,
      booking: bookingId || null,
      user: req.user._id,
      amount,
      paymentMethod,
      status: 'success', // In production, this would come from payment gateway
      processedAt: new Date(),
    });

    // Update order/booking payment status
    if (paymentType === 'order') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        status: 'confirmed',
      });
    } else if (paymentType === 'booking') {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'fully-paid',
        status: 'confirmed',
      });
    }

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const { limit, page } = req.query;

    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Payment.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: payments,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
    });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('booking', 'bookingNumber bookingType')
      .populate('user', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Check ownership
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund successful payments',
      });
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount - payment.refundAmount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount exceeds available amount',
      });
    }

    payment.refundAmount = refundAmount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.status = refundAmount >= payment.amount ? 'refunded' : 'partially-refunded';

    await payment.save();

    // Update related order/booking
    if (payment.paymentType === 'order') {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: payment.status,
        status: 'refunded',
      });
    } else if (payment.paymentType === 'booking') {
      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: payment.status,
        status: 'cancelled',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
    });
  }
};

// ======================
// Admin Routes
// ======================

// @desc    Get all payments (Admin)
// @route   GET /api/payments/all
// @access  Private/Admin
exports.getAllPayments = async (req, res) => {
  try {
    const { status, paymentType, startDate, endDate, limit, page } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (paymentType) {
      query.paymentType = paymentType;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: { ...query, status: 'success' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
          netRevenue: { $sum: { $subtract: ['$amount', '$refundAmount'] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      summary: totals[0] || { totalAmount: 0, totalRefunds: 0, netRevenue: 0 },
      data: payments,
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getPaymentStats = async (req, res) => {
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

    // Daily revenue
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: 'success',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$amount' },
          refunds: { $sum: '$refundAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // By payment method
    const byMethod = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: 'success',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // By type
    const byType = await Payment.aggregate([
      {
        $match: {
          ...dateQuery,
          status: 'success',
        },
      },
      {
        $group: {
          _id: '$paymentType',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Summary
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
          totalRevenue: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
          netRevenue: { $sum: { $subtract: ['$amount', '$refundAmount'] } },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {
          totalRevenue: 0,
          totalRefunds: 0,
          netRevenue: 0,
          transactionCount: 0,
        },
        dailyRevenue,
        byMethod,
        byType,
      },
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
    });
  }
};

