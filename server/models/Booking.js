const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      default: () => `BK-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingType: {
      type: String,
      required: true,
      enum: ['room', 'table', 'garden'],
    },
    // Room Booking Details
    room: {
      roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
      },
      checkInDate: Date,
      checkOutDate: Date,
      numberOfGuests: {
        type: Number,
        min: [1, 'Number of guests must be at least 1'],
        max: [10, 'Number of guests cannot exceed 10'],
      },
      roomType: String,
      numberOfRooms: {
        type: Number,
        default: 1,
        min: [1, 'Number of rooms must be at least 1'],
      },
    },
    // Table Reservation Details
    table: {
      tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
      },
      reservationDate: Date,
      reservationTime: String,
      duration: {
        type: Number, // hours
        default: 2,
        min: [1, 'Duration must be at least 1 hour'],
        max: [6, 'Duration cannot exceed 6 hours'],
      },
      tableLocation: String,
      occasion: {
        type: String,
        enum: ['birthday', 'anniversary', 'business', 'date', 'celebration', 'other', 'none'],
        default: 'none',
      },
    },
    // Garden/Event Booking Details
    garden: {
      gardenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garden',
      },
      eventDate: Date,
      eventStartTime: String,
      eventEndTime: String,
      eventType: String,
      eventName: String,
      expectedGuests: {
        type: Number,
        min: [1, 'Expected guests must be at least 1'],
      },
    },
    // Pricing
    pricing: {
      roomPrice: Number,
      roomNights: Number,
      tablePrice: Number,
      gardenPrice: Number,
      hoursBooked: Number,
      subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative'],
      },
      tax: {
        type: Number,
        required: true,
        min: [0, 'Tax cannot be negative'],
      },
      taxRate: {
        type: Number,
        default: 10,
      },
      serviceCharge: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      deposit: {
        type: Number,
        default: 0,
      },
      depositPaid: {
        type: Boolean,
        default: false,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative'],
      },
      amountPaid: {
        type: Number,
        default: 0,
      },
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    // Payment Status
    paymentStatus: {
      type: String,
      enum: ['pending', 'deposit-paid', 'fully-paid', 'partially-refunded', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'mobile-money', 'bank-transfer'],
    },
    // Check-in/Check-out times
    actualCheckIn: Date,
    actualCheckOut: Date,
    // Special Requests
    specialRequests: {
      type: String,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
    },
    internalNotes: {
      type: String,
      maxlength: [500, 'Internal notes cannot exceed 500 characters'],
    },
    // Cancellation
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // 关联支付
    payments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    }],
    // 评价
    hasReview: {
      type: Boolean,
      default: false,
    },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 计算入住晚数
bookingSchema.virtual('roomNights').get(function () {
  if (this.bookingType === 'room' && this.room.checkInDate && this.room.checkOutDate) {
    const diffTime = Math.abs(this.room.checkOutDate - this.room.checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for status display
bookingSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    'checked-in': 'Checked In',
    'checked-out': 'Checked Out',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show',
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
bookingSchema.virtual('paymentStatusDisplay').get(function () {
  const statusMap = {
    pending: 'Pending Payment',
    'deposit-paid': 'Deposit Paid',
    'fully-paid': 'Fully Paid',
    'partially-refunded': 'Partially Refunded',
    refunded: 'Refunded',
    failed: 'Payment Failed',
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// Calculate pricing before saving
bookingSchema.pre('save', function (next) {
  if (this.bookingType === 'room') {
    const nights = this.roomNights || 1;
    this.pricing.roomNights = nights;
    this.pricing.subtotal = this.pricing.roomPrice * nights * (this.room.numberOfRooms || 1);
  } else if (this.bookingType === 'table') {
    this.pricing.subtotal = this.pricing.tablePrice * this.table.duration;
  } else if (this.bookingType === 'garden') {
    this.pricing.subtotal = this.pricing.gardenPrice * this.pricing.hoursBooked;
  }
  
  this.pricing.totalAmount = 
    this.pricing.subtotal + 
    this.pricing.tax + 
    this.pricing.serviceCharge - 
    this.pricing.discount;
  
  next();
});

// 状态变更时记录历史
bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// Index for queries
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ bookingType: 1, status: 1 });
bookingSchema.index({ 'room.checkInDate': 1 });
bookingSchema.index({ 'table.reservationDate': 1 });
bookingSchema.index({ 'garden.eventDate': 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

