const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      unique: true,
      default: () => `PAY-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`,
    },
    paymentType: {
      type: String,
      required: true,
      enum: ['booking', 'order'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'mobile-money', 'bank-transfer', 'credit'],
    },
    // Card details (only for reference, never store full card info)
    cardLast4: String,
    cardBrand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'none'],
    },
    // Stripe Integration
    stripePaymentIntentId: String,
    stripeChargeId: String,
    stripeCustomerId: String,
    // Transaction details
    transactionId: String,
    referenceNumber: String,
    // Payment status
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'partially-refunded'],
      default: 'pending',
    },
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    }],
    // Refund information
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: String,
    refundedAt: Date,
    refundTransactionId: String,
    // Payment description
    description: String,
    metadata: {
      type: Map,
      of: String,
    },
    // Receipt
    receiptUrl: String,
    receiptNumber: String,
    // Failure details
    failureCode: String,
    failureMessage: String,
    // Timestamps
    processedAt: Date,
    failedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for status display
paymentSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    pending: 'Pending',
    processing: 'Processing',
    success: 'Success',
    failed: 'Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    'partially-refunded': 'Partially Refunded',
  };
  return statusMap[this.status] || this.status;
});

// 状态变更时记录历史
paymentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date.now(),
      note: this.status === 'failed' ? this.failureMessage : undefined,
    });
  }
  next();
});

// Index for queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

