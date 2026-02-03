const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    // Determine folder based on route
    if (req.baseUrl && req.baseUrl.includes('rooms')) {
      uploadPath = 'uploads/rooms/';
    } else if (req.baseUrl && req.baseUrl.includes('menu')) {
      uploadPath = 'uploads/menu/';
    } else if (req.baseUrl && req.baseUrl.includes('gallery')) {
      uploadPath = 'uploads/gallery/';
    } else if (req.baseUrl && req.baseUrl.includes('users')) {
      uploadPath = 'uploads/users/';
    } else if (req.baseUrl && req.baseUrl.includes('tables')) {
      uploadPath = 'uploads/tables/';
    } else if (req.baseUrl && req.baseUrl.includes('garden')) {
      uploadPath = 'uploads/garden/';
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Multiple file upload
exports.uploadMultiple = upload.array('images', 10);

// Single file upload
exports.uploadSingle = upload.single('image');

// Handle upload errors
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

