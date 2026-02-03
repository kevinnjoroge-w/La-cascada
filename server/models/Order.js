const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: String, // Cached name for historical reference
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    specialInstructions: {
      type: String,
      maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    },
    // 选择的 modifiers
    selectedModifiers: [{
      name: String,
      option: String,
      price: Number,
    }],
    // 取消原因（如果取消）
    cancelReason: String,
    // 部分退款金额
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => `ORD-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderType: {
      type: String,
      required: true,
      enum: ['dine-in', 'takeout', 'room-service', 'delivery'],
    },
    items: [orderItemSchema],
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
      default: 10, // 10%
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    serviceCharge: {
      type: Number,
      default: 0,
      min: [0, 'Service charge cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    promoCode: {
      code: String,
      discountAmount: Number,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    // 状态管理
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'delivered', 'cancelled', 'refunded'],
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
    // 支付状态
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'mobile-money', 'bank-transfer', 'credit'],
    },
    // 交付信息
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      instructions: String,
    },
    // 堂食/客房服务信息
    tableNumber: String,
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    roomNumber: String,
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    // 预计和实际时间
    estimatedTime: {
      type: Number, // minutes
    },
    actualTime: {
      type: Number, // minutes
    },
    scheduledTime: Date,
    // 特殊要求
    specialRequests: {
      type: String,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
    },
    // 员工备注
    internalNotes: {
      type: String,
      maxlength: [500, 'Internal notes cannot exceed 500 characters'],
    },
    // 取消/退款信息
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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
    // 厨房信息
    kitchenNotes: [{
      itemName: String,
      instruction: String,
      priority: {
        type: String,
        enum: ['normal', 'rush', 'urgent'],
        default: 'normal',
      },
    }],
    // 关联支付
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for status display
orderSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
orderSchema.virtual('paymentStatusDisplay').get(function () {
  const statusMap = {
    pending: 'Pending Payment',
    partial: 'Partially Paid',
    paid: 'Paid',
    refunded: 'Refunded',
    failed: 'Payment Failed',
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// 生成预计送达时间
orderSchema.methods.calculateEstimatedTime = function () {
  const maxPrepTime = Math.max(...this.items.map(item => 
    item.preparationTime || 20
  ), 20);
  
  let additionalTime = 0;
  if (this.orderType === 'delivery') additionalTime = 30;
  if (this.orderType === 'room-service') additionalTime = 15;
  
  this.estimatedTime = maxPrepTime + additionalTime;
  return this.estimatedTime;
};

// 状态变更时记录历史
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// Index for queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderType: 1, createdAt: -1 });
orderSchema.index({ 'deliveryAddress.city': 1 });

module.exports = mongoose.model('Order', orderSchema);

