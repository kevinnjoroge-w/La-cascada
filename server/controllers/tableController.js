const Table = require('../models/Table');
const Booking = require('../models/Booking');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
exports.getTables = async (req, res) => {
  try {
    const { location, capacity, available } = req.query;

    let query = { isActive: true };

    if (location) {
      query.location = location;
    }

    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    const tables = await Table.find(query).sort({ tableNumber: 1 }).lean();

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tables',
    });
  }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching table',
    });
  }
};

// @desc    Get available tables
// @route   GET /api/tables/available
// @access  Public
exports.getAvailableTables = async (req, res) => {
  try {
    const { date, time, guests, duration } = req.query;

    let query = { isActive: true, isAvailable: true };

    if (guests) {
      query.capacity = { $gte: Number(guests) };
    }

    // Get all tables
    const tables = await Table.find(query).lean();

    // In a real app, check against existing reservations
    // This is a simplified version
    const availableTables = tables.filter((table) => {
      // Add business logic here to check availability
      return true;
    });

    res.status(200).json({
      success: true,
      count: availableTables.length,
      data: availableTables,
    });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking table availability',
    });
  }
};

// @desc    Reserve table
// @route   POST /api/tables/reserve
// @access  Private
exports.reserveTable = async (req, res) => {
  try {
    const { tableId, reservationDate, reservationTime, numberOfGuests, occasion, specialRequests } =
      req.body;

    // Check if table exists and is available
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    if (!table.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Table is not available for reservation',
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      bookingType: 'table',
      table: {
        tableId: table._id,
        reservationDate: new Date(reservationDate),
        reservationTime,
        numberOfGuests,
        occasion,
      },
      pricing: {
        tablePrice: table.minimumSpend || 0,
        subtotal: table.minimumSpend || 0,
        tax: (table.minimumSpend || 0) * 0.1,
        totalAmount: (table.minimumSpend || 0) * 1.1,
      },
      specialRequests,
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Reserve table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reserving table',
    });
  }
};

// @desc    Get user table reservations
// @route   GET /api/tables/reservations
// @access  Private
exports.getUserReservations = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      bookingType: 'table',
    })
      .populate('table.tableId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get user reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
    });
  }
};

// @desc    Create table
// @route   POST /api/tables
// @access  Private/Admin
exports.createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);

    res.status(201).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating table',
    });
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating table',
    });
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Soft delete - just mark as inactive
    table.isActive = false;
    await table.save();

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting table',
    });
  }
};

// @desc    Get table layout
// @route   GET /api/tables/layout
// @access  Public
exports.getTableLayout = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true })
      .select('tableNumber name location capacity features isAvailable')
      .lean();

    // Group tables by location
    const layout = {
      indoor: tables.filter((t) => t.location === 'indoor'),
      outdoor: tables.filter((t) => t.location === 'outdoor'),
      vip: tables.filter((t) => t.location === 'vip'),
      bar: tables.filter((t) => t.location === 'bar'),
      patio: tables.filter((t) => t.location === 'patio'),
    };

    res.status(200).json({
      success: true,
      data: layout,
    });
  } catch (error) {
    console.error('Get table layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching table layout',
    });
  }
};

