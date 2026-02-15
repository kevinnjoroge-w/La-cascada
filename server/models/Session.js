const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    // Device info
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    // Session status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Timestamps
    loggedInAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    loggedOutAt: {
      type: Date,
      default: null,
    },
    // Logout reason
    logoutReason: {
      type: String,
      enum: ['manual', 'expired', 'inactive', 'revoked', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup queries
sessionSchema.index({ expiresAt: 1 });

// Auto-delete expired sessions (TTL)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark session as active (used on each request)
sessionSchema.methods.updateActivity = function () {
  this.lastActivityAt = Date.now();
  return this.save();
};

// Method to logout session
sessionSchema.methods.logout = function (reason = 'manual') {
  this.isActive = false;
  this.loggedOutAt = Date.now();
  this.logoutReason = reason;
  return this.save();
};

// Static method to get active sessions for a user
sessionSchema.statics.getActiveSessions = function (userId) {
  return this.find({
    user: userId,
    isActive: true,
    expiresAt: { $gt: Date.now() },
  }).sort({ lastActivityAt: -1 });
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpiredSessions = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: Date.now() } },
      { loggedOutAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Delete logged-out sessions after 30 days
    ],
  });
};

// Static method to revoke all sessions for a user (for password change, security)
sessionSchema.statics.revokeUserSessions = function (userId, excludeTokenId = null) {
  const query = {
    user: userId,
    isActive: true,
  };

  if (excludeTokenId) {
    query.token = { $ne: excludeTokenId };
  }

  return this.updateMany(query, {
    isActive: false,
    loggedOutAt: Date.now(),
    logoutReason: 'revoked',
  });
};

module.exports = mongoose.model('Session', sessionSchema);
