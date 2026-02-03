const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: ['standard', 'deluxe', 'suite', 'presidential'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [10, 'Capacity cannot exceed 10'],
    },
    amenities: [{
      type: String,
      enum: [
        'wifi',
        'tv',
        'air-conditioning',
        'minibar',
        'safe',
        'balcony',
        'ocean-view',
        'city-view',
        'king-bed',
        'queen-bed',
        'sofa-bed',
        'jacuzzi',
        'kitchenette',
        'workspace',
        'soundproof',
      ],
    }],
    images: [{
      url: String,
      publicId: String,
      isPrimary: { type: Boolean, default: false },
    }],
    pricePerNight: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    floor: {
      type: Number,
      min: [1, 'Floor must be at least 1'],
      max: [50, 'Floor cannot exceed 50'],
    },
    size: {
      type: Number, // in square meters
      min: [0, 'Size cannot be negative'],
    },
    bedType: {
      type: String,
      enum: ['single', 'double', 'twin', 'king', 'queen'],
    },
    view: {
      type: String,
      enum: ['garden', 'pool', 'ocean', 'city', 'mountain', 'none'],
      default: 'none',
    },
    policies: {
      checkInTime: { type: String, default: '15:00' },
      checkOutTime: { type: String, default: '11:00' },
      cancellation: {
        type: String,
        enum: ['free', 'partial', 'strict'],
        default: 'free',
      },
      cancellationHours: { type: Number, default: 24 },
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculated price with discount
roomSchema.virtual('currentPrice').get(function () {
  if (this.discount > 0) {
    return this.pricePerNight * (1 - this.discount / 100);
  }
  return this.pricePerNight;
});

// Virtual for ratings (placeholder)
roomSchema.virtual('rating').get(function () {
  return 4.5; // Placeholder - can be extended with reviews
});

// Index for searching
roomSchema.index({ type: 1, isAvailable: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ capacity: 1 });

// Ensure images array has proper structure
roomSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    // Ensure first image is marked as primary if none is
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);

