const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.post('/register', validate(schemas.userRegister), register);
router.post('/login', validate(schemas.userLogin), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/updateprofile', updateProfile);
router.put('/updatepassword', updatePassword);

module.exports = router;

