const Joi = require('joi');

// User validation schemas
const userRegisterSchema = Joi.object({
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{10,15}$/).optional(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const userUpdateSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{10,15}$/).optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),
  preferences: Joi.object({
    dietary: Joi.array().items(Joi.string()).optional(),
    roomPreferences: Joi.array().items(Joi.string()).optional(),
    communication: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Room validation schemas
const roomSchema = Joi.object({
  roomNumber: Joi.string().required(),
  name: Joi.string().max(100).required(),
  type: Joi.string().valid('standard', 'deluxe', 'suite', 'presidential').required(),
  description: Joi.string().max(1000).optional(),
  shortDescription: Joi.string().max(200).optional(),
  capacity: Joi.number().min(1).max(10).required(),
  amenities: Joi.array().items(
    Joi.string().valid(
      'wifi', 'tv', 'air-conditioning', 'minibar', 'safe', 'balcony',
      'ocean-view', 'city-view', 'king-bed', 'queen-bed', 'sofa-bed',
      'jacuzzi', 'kitchenette', 'workspace', 'soundproof'
    )
  ).optional(),
  pricePerNight: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).max(100).optional(),
  floor: Joi.number().min(1).max(50).optional(),
  size: Joi.number().min(0).optional(),
  bedType: Joi.string().valid('single', 'double', 'twin', 'king', 'queen').optional(),
  view: Joi.string().valid('garden', 'pool', 'ocean', 'city', 'mountain', 'none').optional(),
});

// Table validation schemas
const tableSchema = Joi.object({
  tableNumber: Joi.string().required(),
  name: Joi.string().max(50).optional(),
  location: Joi.string().valid('indoor', 'outdoor', 'vip', 'bar', 'patio').required(),
  capacity: Joi.number().min(1).max(20).required(),
  features: Joi.array().items(
    Joi.string().valid(
      'tv-view', 'bar-proximity', 'quiet', 'lively', 'window',
      'corner', 'booth', 'wheelchair-accessible', 'outlet', 'large-group'
    )
  ).optional(),
  minimumSpend: Joi.number().min(0).optional(),
});

// Garden validation schemas
const gardenSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(2000).optional(),
  shortDescription: Joi.string().max(300).optional(),
  capacity: Joi.number().min(1).max(1000).required(),
  amenities: Joi.array().items(
    Joi.string().valid(
      'stage', 'sound-system', 'lighting', 'projector', 'wifi',
      'parking', 'catering', 'bar-service', 'outdoor-seating',
      'covered-area', 'air-conditioning', 'heating', 'dance-floor',
      'photo-area', 'green-area'
    )
  ).optional(),
  pricing: Joi.object({
    pricePerHour: Joi.number().min(0).required(),
    pricePerDay: Joi.number().min(0).optional(),
    minimumHours: Joi.number().min(1).optional(),
    securityDeposit: Joi.number().min(0).optional(),
    cleaningFee: Joi.number().min(0).optional(),
  }).optional(),
  eventTypes: Joi.array().items(
    Joi.string().valid(
      'wedding', 'birthday', 'corporate', 'conference', 'concert',
      'festival', 'private-party', 'reception', 'photoshoot', 'other'
    )
  ).optional(),
});

// Menu category validation schemas
const menuCategorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(500).optional(),
  icon: Joi.string().optional(),
  displayOrder: Joi.number().optional(),
  mealType: Joi.string()
    .valid('breakfast', 'lunch', 'dinner', 'all-day', 'brunch', 'snacks', 'drinks')
    .optional(),
});

// Menu item validation schemas
const menuItemSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(1000).optional(),
  shortDescription: Joi.string().max(200).optional(),
  category: Joi.string().required(),
  subcategory: Joi.string().optional(),
  price: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0).optional(),
  ingredients: Joi.array().items(Joi.string()).optional(),
  allergens: Joi.array().items(
    Joi.string().valid(
      'gluten', 'dairy', 'eggs', 'nuts', 'peanuts', 'soy', 'fish',
      'shellfish', 'sesame', 'mustard', 'celery', 'lupin', 'mollusks', 'sulfites'
    )
  ).optional(),
  dietary: Joi.object({
    isVegetarian: Joi.boolean().optional(),
    isVegan: Joi.boolean().optional(),
    isGlutenFree: Joi.boolean().optional(),
    isHalal: Joi.boolean().optional(),
    isKosher: Joi.boolean().optional(),
  }).optional(),
  spiceLevel: Joi.number().min(0).max(5).optional(),
  preparationTime: Joi.number().min(0).optional(),
  calories: Joi.number().min(0).optional(),
  isAvailable: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isNew: Joi.boolean().optional(),
  discount: Joi.number().min(0).max(100).optional(),
  tags: Joi.array().items(
    Joi.string().valid(
      'popular', 'bestseller', 'chef-special', 'new-arrival',
      'limited-time', 'signature', 'healthy', 'value-meal'
    )
  ).optional(),
});

// Order validation schemas
const orderItemSchema = Joi.object({
  menuItem: Joi.string().required(),
  quantity: Joi.number().min(1).required(),
  specialInstructions: Joi.string().max(500).optional(),
});

const orderSchema = Joi.object({
  orderType: Joi.string().valid('dine-in', 'takeout', 'room-service', 'delivery').required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  scheduledTime: Joi.date().optional(),
  specialRequests: Joi.string().max(1000).optional(),
  deliveryAddress: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    country: Joi.string().optional(),
    instructions: Joi.string().optional(),
  }).optional(),
  tableNumber: Joi.string().optional(),
  roomNumber: Joi.string().optional(),
});

// Booking validation schemas
const roomBookingSchema = Joi.object({
  roomId: Joi.string().required(),
  checkInDate: Joi.date().required(),
  checkOutDate: Joi.date().greater(Joi.ref('checkInDate')).required(),
  numberOfGuests: Joi.number().min(1).max(10).required(),
  numberOfRooms: Joi.number().min(1).optional(),
  specialRequests: Joi.string().max(1000).optional(),
});

const tableBookingSchema = Joi.object({
  tableId: Joi.string().required(),
  reservationDate: Joi.date().required(),
  reservationTime: Joi.string().required(),
  duration: Joi.number().min(1).max(6).optional(),
  numberOfGuests: Joi.number().min(1).max(20).required(),
  occasion: Joi.string()
    .valid('birthday', 'anniversary', 'business', 'date', 'celebration', 'other', 'none')
    .optional(),
  specialRequests: Joi.string().max(1000).optional(),
});

const gardenBookingSchema = Joi.object({
  gardenId: Joi.string().required(),
  eventDate: Joi.date().required(),
  eventStartTime: Joi.string().required(),
  eventEndTime: Joi.string().required(),
  eventType: Joi.string().required(),
  eventName: Joi.string().optional(),
  expectedGuests: Joi.number().min(1).required(),
  specialRequests: Joi.string().max(1000).optional(),
});

// Validation middleware factory
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    next();
  };
};

// Export schemas for reuse
exports.schemas = {
  userRegister: userRegisterSchema,
  userLogin: userLoginSchema,
  userUpdate: userUpdateSchema,
  room: roomSchema,
  table: tableSchema,
  garden: gardenSchema,
  menuCategory: menuCategorySchema,
  menuItem: menuItemSchema,
  order: orderSchema,
  roomBooking: roomBookingSchema,
  tableBooking: tableBookingSchema,
  gardenBooking: gardenBookingSchema,
};

