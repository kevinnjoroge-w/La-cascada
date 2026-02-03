// Authorize roles - check if user has required role
exports.authorize = (...roles) => {
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

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
};

// Check if user is admin or staff
exports.isAdminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Staff access required',
    });
  }
};

// Check resource ownership or admin access
exports.checkOwnership = (Model, paramIdField = 'id', userField = 'user') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramIdField]);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check if user owns the resource or is admin
      const resourceUserId = resource[userField]?.toString();
      const isOwner = resourceUserId === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Check ownership error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error checking resource ownership',
      });
    }
  };
};

// For non-MongoDB resources, use request body/user
exports.checkResourceOwnership = (req, res, next) => {
  const resourceUserId = req.body.userId || req.body.user?._id;
  const isOwner = resourceUserId === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource',
    });
  }

  next();
};

