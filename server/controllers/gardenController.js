const Garden = require('../models/Garden');
const Booking = require('../models/Booking');

// @desc    Get all gardens
// @route   GET /api/garden
// @access  Public
exports.getGardens = async (req, res) => {
  try {
    const { capacity, eventType, available, featured } = req.query;

    let query = { isActive: true };

    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    if (eventType) {
      query.eventTypes = eventType;
    }

    if (available === 'true') {
      query.isAvailable = true;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const gardens = await Garden.find(query)
      .sort({ featured: -1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: gardens.length,
      data: gardens,
    });
  } catch (error) {
    console.error('Get gardens error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gardens',
    });
  }
};

// @desc    Get single garden
// @route   GET /api/garden/:id
// @access  Public
exports.getGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id);

    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Garden not found',
      });
    }

    res.status(200).json({
      success: true,
      data: garden,
    });
  } catch (error) {
    console.error('Get garden error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching garden',
    });
  }
};

// @desc    Get garden availability
// @route   GET /api/garden/availability
// @access  Public
exports.getGardenAvailability = async (req, res) => {
  try {
    const { date, eventType, guests } = req.query;

    let query = { isActive: true, isAvailable: true };

    if (guests) {
      query.capacity = { $gte: Number(guests) };
    }

    if (eventType) {
      query.eventTypes = eventType;
    }

    const gardens = await Garden.find(query).lean();

    // Check availability for the given date
    const availableGardens = await Promise.all(
      gardens.map(async (garden) => {
        // Check if there are any bookings for this date
        const existingBooking = await Booking.findOne({
          garden: { gardenId: garden._id },
          'garden.eventDate': new Date(date),
          status: { $nin: ['cancelled', 'no-show'] },
        });

        return {
          ...garden,
          isAvailable: !existingBooking,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: availableGardens.filter((g) => g.isAvailable).length,
      data: availableGardens,
    });
  } catch (error) {
    console.error('Get garden availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking garden availability',
    });
  }
};

// @desc    Book garden
// @route   POST /api/garden/book
// @access  Private
exports.bookGarden = async (req, res) => {
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

    // Check if garden exists
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
        message: 'Garden is not available for booking',
      });
    }

    // Calculate hours and price
    const startHour = parseInt(eventStartTime.split(':')[0]);
    const endHour = parseInt(eventEndTime.split(':')[0]);
    const hoursBooked = Math.max(endHour - startHour, garden.pricing.minimumHours);

    const subtotal = garden.pricing.pricePerHour * hoursBooked;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax + (garden.pricing.cleaningFee || 0);

    // Create booking
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

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Book garden error:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking garden',
    });
  }
};

// @desc    Get user garden bookings
// @route   GET /api/garden/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
      bookingType: 'garden',
    })
      .populate('garden.gardenId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get user garden bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
    });
  }
};

// @desc    Create garden
// @route   POST /api/garden
// @access  Private/Admin
exports.createGarden = async (req, res) => {
  try {
    const garden = await Garden.create(req.body);

    res.status(201).json({
      success: true,
      data: garden,
    });
  } catch (error) {
    console.error('Create garden error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating garden',
    });
  }
};

// @desc    Update garden
// @route   PUT /api/garden/:id
// @access  Private/Admin
exports.updateGarden = async (req, res) => {
  try {
    const garden = await Garden.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Garden not found',
      });
    }

    res.status(200).json({
      success: true,
      data: garden,
    });
  } catch (error) {
    console.error('Update garden error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating garden',
    });
  }
};

// @desc    Update garden pricing
// @route   PUT /api/garden/:id/pricing
// @access  Private/Admin
exports.updateGardenPricing = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id);

    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Garden not found',
      });
    }

    if (req.body.pricing) {
      garden.pricing = { ...garden.pricing, ...req.body.pricing };
    }

    await garden.save();

    res.status(200).json({
      success: true,
      data: garden,
    });
  } catch (error) {
    console.error('Update garden pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating garden pricing',
    });
  }
};

// @desc    Delete garden
// @route   DELETE /api/garden/:id
// @access  Private/Admin
exports.deleteGarden = async (req, res) => {
  try {
    const garden = await Garden.findById(req.params.id);

    if (!garden) {
      return res.status(404).json({
        success: false,
        message: 'Garden not found',
      });
    }

    // Soft delete
    garden.isActive = false;
    await garden.save();

    res.status(200).json({
      success: true,
      message: 'Garden deleted successfully',
    });
  } catch (error) {
    console.error('Delete garden error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting garden',
    });
  }
};

