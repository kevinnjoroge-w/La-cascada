const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, capacity, available, featured } = req.query;

    let query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
    }

    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Filter by capacity
    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    const rooms = await Room.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
    });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
    });
  }
};

// @desc    Get room availability
// @route   GET /api/rooms/available
// @access  Public
exports.getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, guests, type } = req.query;

    let query = { isAvailable: true };

    if (type) {
      query.type = type;
    }

    if (guests) {
      query.capacity = { $gte: Number(guests) };
    }

    // In a real app, you'd also check for overlapping bookings
    const rooms = await Room.find(query).sort({ pricePerNight: 1 }).lean();

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking room availability',
    });
  }
};

// @desc    Create room
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room',
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room',
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
    });
  }
};

// @desc    Get room types with counts
// @route   GET /api/rooms/types/count
// @access  Public
exports.getRoomTypesCount = async (req, res) => {
  try {
    const types = await Room.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('Get room types count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room types',
    });
  }
};

// @desc    Update room images
// @route   PUT /api/rooms/:id/images
// @access  Private/Admin
exports.updateRoomImages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Handle image uploads (would integrate with Cloudinary in production)
    if (req.body.images) {
      room.images = req.body.images;
    }

    await room.save();

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Update room images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room images',
    });
  }
};

// @desc    Update room pricing
// @route   PUT /api/rooms/:id/pricing
// @access  Private/Admin
exports.updateRoomPricing = async (req, res) => {
  try {
    const { pricePerNight, originalPrice, discount } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (pricePerNight !== undefined) room.pricePerNight = pricePerNight;
    if (originalPrice !== undefined) room.originalPrice = originalPrice;
    if (discount !== undefined) room.discount = discount;

    await room.save();

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Update room pricing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room pricing',
    });
  }
};

