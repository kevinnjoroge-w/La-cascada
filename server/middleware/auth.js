const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

/**
 * Authorize roles - check if user has required role
 * Defined at top to ensure it's available for other modules
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Protect routes - verify JWT token and session
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    // Validate session
    const session = await Session.findOne({
      token,
      user: user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session not found or has been revoked',
      });
    }

    // Check session expiration
    if (session.expiresAt < new Date()) {
      session.isActive = false;
      session.logoutReason = 'expired';
      await session.save();

      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please login again.',
      });
    }

    // Update last activity
    session.lastActivityAt = new Date();
    await session.save();

    // Attach user and session to request
    req.user = user;
    req.session = session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Optional auth - doesn't fail if no token, but attaches user if present
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
};

// Check if user is logged in (for frontend)
const isAuthenticated = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: 'Not authenticated',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        isAuthenticated: false,
        message: 'User not found',
      });
    }

    req.user = user;
    res.status(200).json({
      success: true,
      isAuthenticated: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
      message: 'Invalid token',
    });
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  isAuthenticated,
};

