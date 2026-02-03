const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Payment = require('../models/Payment');

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { status, orderType, limit, page } = req.query;

    let query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.menuItem', 'name description price images')
      .populate('tableId', 'tableNumber location')
      .populate('roomId', 'roomNumber name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
    });
  }
};

// @desc    Track order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .select('orderNumber status statusHistory estimatedTime createdAt')
      .populate('items.menuItem', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking order',
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderType, items, scheduledTime, specialRequests, deliveryAddress, tableNumber, roomNumber } =
      req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item',
      });
    }

    // Fetch menu items and calculate prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menuItem}`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is not available`,
        });
      }

      const price = menuItem.currentPrice;
      subtotal += price * item.quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price,
        specialInstructions: item.specialInstructions,
      });
    }

    // Calculate totals
    const tax = subtotal * 0.1; // 10% tax
    let deliveryFee = 0;
    if (orderType === 'delivery') {
      deliveryFee = 5; // Fixed delivery fee
    }

    const totalAmount = subtotal + tax + deliveryFee;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderType,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      specialRequests,
      deliveryAddress,
      tableNumber,
      roomNumber,
    });

    // Populate items for response
    await order.populate('items.menuItem', 'name images');

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Customer cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Staff
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'served',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // Status transition validation
    const currentStatus = order.status;
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['served', 'delivered'],
      served: ['delivered'],
      delivered: ['refunded'],
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${currentStatus} to ${status}`,
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: req.body.note,
      updatedBy: req.user._id,
    });

    // Calculate actual time if delivered
    if (status === 'delivered' || status === 'served') {
      const startTime = order.createdAt;
      const endTime = new Date();
      order.actualTime = Math.round((endTime - startTime) / 60000); // minutes
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
    });
  }
};

// ======================
// Admin Routes
// ======================

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, orderType, date, limit, page } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (orderType) {
      query.orderType = orderType;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
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

    // Get counts by status
    const statusCounts = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get counts by order type
    const typeCounts = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$orderType', count: { $sum: 1 } } },
    ]);

    // Get total revenue
    const revenue = await Order.aggregate([
      {
        $match: {
          ...dateQuery,
          status: { $nin: ['cancelled', 'refunded'] },
          paymentStatus: 'paid',
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Get average order value
    const avgOrder = await Order.aggregate([
      {
        $match: {
          ...dateQuery,
          status: { $nin: ['cancelled', 'refunded'] },
        },
      },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusCounts,
        byType: typeCounts,
        totalRevenue: revenue[0]?.total || 0,
        averageOrderValue: avgOrder[0]?.avg || 0,
      },
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics',
    });
  }
};

// @desc    Add review to order
// @route   POST /api/orders/:id/review
// @access  Private
exports.addOrderReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const order = await Order.findById(req.params.id);

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

    if (order.hasReview) {
      return res.status(400).json({
        success: false,
        message: 'Order already has a review',
      });
    }

    if (!['delivered', 'served'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed orders',
      });
    }

    order.review = {
      rating,
      comment,
      createdAt: new Date(),
    };
    order.hasReview = true;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Review added successfully',
    });
  } catch (error) {
    console.error('Add order review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
    });
  }
};

