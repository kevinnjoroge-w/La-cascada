const express = require('express');
const router = express.Router();
const {
  getGardens,
  getGarden,
  getGardenAvailability,
  bookGarden,
  getUserBookings,
  createGarden,
  updateGarden,
  updateGardenPricing,
  deleteGarden,
} = require('../controllers/gardenController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.get('/', getGardens);
router.get('/availability', getGardenAvailability);
router.get('/:id', getGarden);

// Protected routes
router.use(protect);
router.post('/book', validate(schemas.gardenBooking), bookGarden);
router.get('/user/bookings', getUserBookings);

// Admin routes
router.use(authorize('admin'));
router.post('/', validate(schemas.garden), createGarden);
router.put('/:id', updateGarden);
router.put('/:id/pricing', updateGardenPricing);
router.delete('/:id', deleteGarden);

module.exports = router;

