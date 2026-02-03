const express = require('express');
const router = express.Router();
const {
  getUserBookings,
  getBooking,
  createRoomBooking,
  createTableBooking,
  createGardenBooking,
  updateBooking,
  cancelBooking,
  checkIn,
  checkOut,
  getAllBookings,
  updateBookingStatus,
  addBookingReview,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Protected routes - User
router.use(protect);
router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.post('/room', validate(schemas.roomBooking), createRoomBooking);
router.post('/table', validate(schemas.tableBooking), createTableBooking);
router.post('/garden', validate(schemas.gardenBooking), createGardenBooking);
router.put('/:id', updateBooking);
router.put('/:id/cancel', cancelBooking);
router.post('/:id/review', addBookingReview);

// Check-in/out routes
router.put('/:id/checkin', authorize('admin'), checkIn);
router.put('/:id/checkout', authorize('admin'), checkOut);

// Admin routes
router.use(authorize('admin'));
router.get('/all', getAllBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;

