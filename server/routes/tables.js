const express = require('express');
const router = express.Router();
const {
  getTables,
  getTable,
  getAvailableTables,
  reserveTable,
  getUserReservations,
  createTable,
  updateTable,
  deleteTable,
  getTableLayout,
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.get('/', getTables);
router.get('/layout', getTableLayout);
router.get('/available', getAvailableTables);
router.get('/:id', getTable);

// Protected routes
router.use(protect);
router.post('/reserve', validate(schemas.tableBooking), reserveTable);
router.get('/user/reservations', getUserReservations);

// Admin routes
router.use(authorize('admin'));
router.post('/', validate(schemas.table), createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

module.exports = router;

