// Utility helper functions

// Format currency
exports.formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date
exports.formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format time
exports.formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Calculate nights between two dates
exports.calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generate random string
exports.generateRandomString = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email
exports.isValidEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Sanitize string
exports.sanitizeString = (str) => {
  return str
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000);
};

// Paginate results
exports.paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Build query object from filters
exports.buildQuery = (filters, allowedFilters) => {
  const query = {};
  
  Object.keys(filters).forEach((key) => {
    if (allowedFilters.includes(key) && filters[key] !== undefined && filters[key] !== '') {
      if (key === 'search') {
        query.$or = [
          { name: { $regex: filters[key], $options: 'i' } },
          { description: { $regex: filters[key], $options: 'i' } },
        ];
      } else if (key === 'minPrice' || key === 'maxPrice') {
        query.price = query.price || {};
        if (key === 'minPrice') query.price.$gte = parseFloat(filters[key]);
        if (key === 'maxPrice') query.price.$lte = parseFloat(filters[key]);
      } else if (key === 'minCapacity' || key === 'maxCapacity') {
        query.capacity = query.capacity || {};
        if (key === 'minCapacity') query.capacity.$gte = parseInt(filters[key]);
        if (key === 'maxCapacity') query.capacity.$lte = parseInt(filters[key]);
      } else {
        query[key] = filters[key];
      }
    }
  });
  
  return query;
};

// Sleep utility for testing
exports.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Get file extension
exports.getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Truncate string
exports.truncate = (str, length = 100) => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

// Parse boolean
exports.parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return null;
};

// Calculate discount percentage
exports.calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Get relative time (e.g., "2 hours ago")
exports.getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now - target) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return exports.formatDate(date);
};

// Group array by key
exports.groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
};

// Remove duplicates from array
exports.unique = (array, key) => {
  const seen = new Set();
  return array.filter((item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// Sort array by multiple fields
exports.sortBy = (array, ...keys) => {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const direction = key.startsWith('-') ? -1 : 1;
      const field = key.replace(/^-/, '');
      if (a[field] < b[field]) return -1 * direction;
      if (a[field] > b[field]) return 1 * direction;
    }
    return 0;
  });
};

// Validate password strength
exports.validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    checks,
    score: score / Object.keys(checks).length,
    isStrong: score >= 4,
  };
};

// Generate booking reference
exports.generateBookingReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
};

// Generate order number
exports.generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

