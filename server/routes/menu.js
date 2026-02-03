const express = require('express');
const router = express.Router();
const {
  // Categories
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  // Menu Items
  getMenuItems,
  getItemsByCategory,
  getFeaturedItems,
  searchItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getFullMenu,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// Public routes - Categories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);

// Public routes - Menu Items
router.get('/', getMenuItems);
router.get('/full', getFullMenu);
router.get('/featured', getFeaturedItems);
router.get('/search', searchItems);
router.get('/category/:id', getItemsByCategory);
router.get('/item/:id', getMenuItem);

// Protected routes - Categories
router.use(protect);
router.post('/categories', authorize('admin'), validate(schemas.menuCategory), createCategory);
router.put('/categories/:id', authorize('admin'), updateCategory);
router.delete('/categories/:id', authorize('admin'), deleteCategory);

// Protected routes - Menu Items
router.post('/items', authorize('admin'), validate(schemas.menuItem), createMenuItem);
router.put('/items/:id', authorize('admin'), updateMenuItem);
router.delete('/items/:id', authorize('admin'), deleteMenuItem);
router.put('/items/:id/availability', authorize('admin'), toggleAvailability);
router.put('/items/:id/images', authorize('admin'), uploadSingle, handleUploadError);

module.exports = router;

