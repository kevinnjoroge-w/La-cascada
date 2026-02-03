const mongoose = require('mongoose');

const gardenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Garden name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [1000, 'Capacity cannot exceed 1000'],
    },
    amenities: [{
      type: String,
      enum: [
        'stage',
        'sound-system',
        'lighting',
        'projector',
        'wifi',
        'parking',
        'catering',
        'bar-service',
        'outdoor-seating',
        'covered-area',
        'air-conditioning',
        'heating',
        'dance-floor',
        'photo-area',
        'green-area',
      ],
    }],
    images: [{
      url: String,
      publicId: String,
      isPrimary: { type: Boolean, default: false },
    }],
    pricing: {
      pricePerHour: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
      },
      pricePerDay: {
        type: Number,
        min: [0, 'Price cannot be negative'],
      },
      minimumHours: {
        type: Number,
        default: 2,
        min: [1, 'Minimum hours must be at least 1'],
      },
      securityDeposit: {
        type: Number,
        default: 0,
      },
      cleaningFee: {
        type: Number,
        default: 0,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    eventTypes: [{
      type: String,
      enum: [
        'wedding',
        'birthday',
        'corporate',
        'conference',
        'concert',
        'festival',
        'private-party',
        'reception',
        'photoshoot',
        'other',
      ],
    }],
    maximumDuration: {
      type: Number, // in hours
      default: 24,
    },
    setupTime: {
      type: Number, // in hours before event
      default: 2,
    },
    breakdownTime: {
      type: Number, // in hours after event
      default: 2,
    },
    rules: [{
      type: String,
    }],
    location: {
      area: String,
      floor: String,
      directions: String,
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
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

// Virtual for hourly rate after discount (if any)
gardenSchema.virtual('effectiveHourlyRate').get(function () {
  return this.pricing.pricePerHour;
});

// Index for searching
gardenSchema.index({ isActive: 1, isAvailable: 1, capacity: 1 });
gardenSchema.index({ 'pricing.pricePerHour': 1 });

module.exports = mongoose.model('Garden', gardenSchema);

