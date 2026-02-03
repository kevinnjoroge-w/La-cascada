const mongoose = require('mongoose');

const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      trim: true,
    },
    image: {
      url: String,
      publicId: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    availableFrom: {
      type: String, // e.g., "11:00"
    },
    availableUntil: {
      type: String, // e.g., "22:00"
    },
    //区分主要类型和子类型
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      default: null,
    },
    //餐品类型
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'all-day', 'brunch', 'snacks', 'drinks'],
      default: 'all-day',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for item count
menuCategorySchema.virtual('itemCount', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Index for ordering and filtering
menuCategorySchema.index({ displayOrder: 1 });
menuCategorySchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('MenuCategory', menuCategorySchema);

