const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoom,
  getAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomTypesCount,
  updateRoomImages,
  updateRoomPricing,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getRooms);
router.get('/available', getAvailableRooms);
router.get('/types/count', getRoomTypesCount);
router.get('/:id', getRoom);

// Protected routes
router.use(protect);
router.post('/', authorize('admin'), validate(schemas.room), createRoom);
router.put('/:id', authorize('admin'), updateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);
router.put('/:id/images', authorize('admin'), uploadSingle, handleUploadError, updateRoomImages);
router.put('/:id/pricing', authorize('admin'), updateRoomPricing);

module.exports = router;

