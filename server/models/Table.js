const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    location: {
      type: String,
      required: true,
      enum: ['indoor', 'outdoor', 'vip', 'bar', 'patio'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20'],
    },
    features: [{
      type: String,
      enum: [
        'tv-view',
        'bar-proximity',
        'quiet',
        'lively',
        'window',
        'corner',
        'booth',
        'wheelchair-accessible',
        'outlet',
        'large-group',
      ],
    }],
    minimumSpend: {
      type: Number,
      default: 0,
      min: [0, 'Minimum spend cannot be negative'],
    },
    images: [{
      url: String,
      publicId: String,
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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
  },
  {
    timestamps: true,
  }
);

// Index for availability search
tableSchema.index({ location: 1, isActive: 1, capacity: 1 });

module.exports = mongoose.model('Table', tableSchema);

