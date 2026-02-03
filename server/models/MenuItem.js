const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuCategory',
      default: null,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    images: [{
      url: String,
      publicId: String,
      isPrimary: { type: Boolean, default: false },
    }],
    ingredients: [{
      type: String,
    }],
    allergens: [{
      type: String,
      enum: [
        'gluten',
        'dairy',
        'eggs',
        'nuts',
        'peanuts',
        'soy',
        'fish',
        'shellfish',
        'sesame',
        'mustard',
        'celery',
        'lupin',
        'mollusks',
        'sulfites',
      ],
    }],
    dietary: {
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
      isHalal: { type: Boolean, default: false },
      isKosher: { type: Boolean, default: false },
    },
    spiceLevel: {
      type: Number,
      min: [0, 'Spice level must be at least 0'],
      max: [5, 'Spice level cannot exceed 5'],
      default: 0,
    },
    preparationTime: {
      type: Number, // in minutes
      min: [0, 'Preparation time cannot be negative'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    servingSize: {
      type: String,
    },
    nutritionInfo: {
      protein: String,
      carbohydrates: String,
      fat: String,
      fiber: String,
      sodium: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    tags: [{
      type: String,
      enum: [
        'popular',
        'bestseller',
        'chef-special',
        'new-arrival',
        'limited-time',
        'signature',
        'healthy',
        'value-meal',
      ],
    }],
    modifiers: [{
      name: String,
      type: {
        type: String,
        enum: ['single', 'multiple'],
      },
      required: { type: Boolean, default: false },
      options: [{
        name: String,
        price: { type: Number, default: 0 },
        isDefault: { type: Boolean, default: false },
      }],
    }],
    //酒水特定
    alcoholContent: {
      type: Number, // percentage
      min: [0, 'Alcohol content cannot be negative'],
    },
    volume: {
      type: String, // e.g., "330ml", "500ml"
    },
    wineType: {
      type: String,
      enum: ['red', 'white', 'rose', 'sparkling', 'fortified', 'none'],
      default: 'none',
    },
    // 上架设置
    availableFromDate: Date,
    availableUntilDate: Date,
    availableFromTime: String,
    availableUntilTime: String,
    // 排序
    displayOrder: {
      type: Number,
      default: 0,
    },
    // 销售统计
    soldCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for current price with discount
menuItemSchema.virtual('currentPrice').get(function () {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual for calculating final price
menuItemSchema.methods.getFinalPrice = function () {
  return this.currentPrice;
};

// Index for searching and filtering
menuItemSchema.index({ category: 1, isAvailable: 1 });
menuItemSchema.index({ isFeatured: 1, isAvailable: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ 'dietary.isVegetarian': 1, 'dietary.isVegan': 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

// Ensure images array has proper structure
menuItemSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

