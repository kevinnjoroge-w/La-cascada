const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Table = require('../models/Table');
const Garden = require('../models/Garden');

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const { type, status } = req.query;

    let query = { user: req.user._id };

    if (type) {
      query.bookingType = type;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('room.roomId', 'name images roomNumber')
      .populate('table.tableId', 'tableNumber location capacity')
      .populate('garden.gardenId', 'name images')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room.roomId')
      .populate('table.tableId')
      .populate('garden.gardenId')
      .populate('user', 'firstName lastName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
    });
  }
};

// @desc    Create room booking
// @route   POST /api/bookings/room
// @access  Private
exports.createRoomBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, numberOfGuests, numberOfRooms, specialRequests } =
      req.body;

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available',
      });
    }

    // Check capacity
    if (numberOfGuests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${room.capacity} guests`,
      });
    }

    // Calculate nights and price
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomsToBook = numberOfRooms || 1;
    const subtotal = room.currentPrice * nights * roomsToBook;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      bookingType: 'room',
      room: {
        roomId: room._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests,
        numberOfRooms: roomsToBook,
        roomType: room.type,
      },
      pricing: {
        roomPrice: room.currentPrice,
        roomNights: nights,
        subtotal,
        tax,
        taxRate: 10,
        totalAmount,
        deposit: totalAmount * 0.2, // 20% deposit
      },
      specialRequests,
    });

    await booking.populate('room.roomId', 'name images roomNumber');

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create room booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room booking',
    });
  }
};

// @desc    Create table booking
// @route   POST /api/bookings/table
// @access  Private
exports.createTableBooking = async (req, res) => {
  try {
    const { tableId, reservationDate, reservationTime, numberOfGuests, duration, occasion, specialRequests } =
      req.body;

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
        message: 'Table is not available',
      });
    }

    if (numberOfGuests > table.capacity) {
      return res.status(400).json({
        success: false,
        message: `Table capacity is ${table.capacity} guests`,
      });
    }

    const bookingDuration = duration || 2;
    const subtotal = (table.minimumSpend || 0) * bookingDuration;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    const booking = await Booking.create({
      user: req.user._id,
      bookingType: 'table',
      table: {
        tableId: table._id,
        reservationDate: new Date(reservationDate),
        reservationTime,
        duration: bookingDuration,
        numberOfGuests,
        occasion,
        tableLocation: table.location,
      },
      pricing: {
        tablePrice: table.minimumSpend || 0,
        subtotal,
        tax,
        totalAmount,
        deposit: 0, // No deposit for table booking
      },
      specialRequests,
    });

    await booking.populate('table.tableId', 'tableNumber location');

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create table booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating table booking',
    });
  }
};

// @desc    Create garden booking
// @route   POST /api/bookings/garden
// @access  Private
exports.createGardenBooking = async (req, res) => {
  try {
    const {
      gardenId,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventType,
      eventName,
      expectedGuests,
      specialRequests,
    } = req.body;

    const garden = await Garden.findById(gardenId);
    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Garden not found',
      });
    }

    if (!garden.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Garden is not available',
      });
    }

    if (expectedGuests > garden.capacity) {
      return res.status(400).json({
        success: false,
        message: `Garden capacity is ${garden.capacity} guests`,
      });
    }

    // Calculate hours
    const startHour = parseInt(eventStartTime.split(':')[0]);
    const endHour = parseInt(eventEndTime.split(':')[0]);
    const hoursBooked = Math.max(endHour - startHour, garden.pricing.minimumHours);

    const subtotal = garden.pricing.pricePerHour * hoursBooked;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax + (garden.pricing.cleaningFee || 0);

    const booking = await Booking.create({
      user: req.user._id,
      bookingType: 'garden',
      garden: {
        gardenId: garden._id,
        eventDate: new Date(eventDate),
        eventStartTime,
        eventEndTime,
        eventType,
        eventName,
        expectedGuests,
      },
      pricing: {
        gardenPrice: garden.pricing.pricePerHour,
        hoursBooked,
        subtotal,
        tax,
        taxRate: 10,
        cleaningFee: garden.pricing.cleaningFee || 0,
        totalAmount,
        deposit: totalAmount * 0.3, // 30% deposit
      },
      specialRequests,
    });

    await booking.populate('garden.gardenId', 'name images');

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create garden booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating garden booking',
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Only allow updates for pending/confirmed bookings
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update booking in current status',
      });
    }

    // Update allowed fields
    const allowedUpdates = ['specialRequests', 'internalNotes'];
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        booking[key] = req.body[key];
      }
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if cancellable
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`,
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Customer cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user._id;

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
    });
  }
};

// @desc    Check in
// @route   PUT /api/bookings/:id/checkin
// @access  Private/Admin
exports.checkIn = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.bookingType !== 'room') {
      return res.status(400).json({
        success: false,
        message: 'Check-in is only for room bookings',
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Can only check in confirmed bookings',
      });
    }

    booking.status = 'checked-in';
    booking.actualCheckIn = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing check-in',
    });
  }
};

// @desc    Check out
// @route   PUT /api/bookings/:id/checkout
// @access  Private/Admin
exports.checkOut = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.bookingType !== 'room') {
      return res.status(400).json({
        success: false,
        message: 'Check-out is only for room bookings',
      });
    }

    if (booking.status !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Can only check out checked-in bookings',
      });
    }

    booking.status = 'checked-out';
    booking.actualCheckOut = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing check-out',
    });
  }
};

// ======================
// Admin Routes
// ======================

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/all
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { type, status, date, page, limit } = req.query;

    let query = {};

    if (type) {
      query.bookingType = type;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const targetDate = new Date(date);
      if (type === 'room') {
        query['room.checkInDate'] = {
          $gte: targetDate.setHours(0, 0, 0, 0),
          $lt: targetDate.setHours(23, 59, 59, 999),
        };
      } else if (type === 'table') {
        query['table.reservationDate'] = {
          $gte: targetDate.setHours(0, 0, 0, 0),
          $lt: targetDate.setHours(23, 59, 59, 999),
        };
      } else if (type === 'garden') {
        query['garden.eventDate'] = {
          $gte: targetDate.setHours(0, 0, 0, 0),
          $lt: targetDate.setHours(23, 59, 59, 999),
        };
      }
    }

    const limitNum = parseInt(limit) || 20;
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('room.roomId', 'name roomNumber')
      .populate('table.tableId', 'tableNumber location')
      .populate('garden.gardenId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: bookings,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
    });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const validStatuses = [
      'pending',
      'confirmed',
      'checked-in',
      'checked-out',
      'completed',
      'cancelled',
      'no-show',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: req.user._id,
    });

    if (status === 'checked-in') {
      booking.actualCheckIn = new Date();
    } else if (status === 'checked-out') {
      booking.actualCheckOut = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
    });
  }
};

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private
exports.addBookingReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const booking = await Booking.findById(req.params.id);

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

    if (booking.hasReview) {
      return res.status(400).json({
        success: false,
        message: 'Booking already has a review',
      });
    }

    booking.review = {
      rating,
      comment,
      createdAt: new Date(),
    };
    booking.hasReview = true;

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Add booking review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
    });
  }
};

