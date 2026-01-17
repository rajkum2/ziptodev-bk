const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimit');
const validate = require('../middlewares/validate');

// Send OTP
router.post('/send-otp',
  authLimiter,
  [
    body('phone').notEmpty().withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/).withMessage('Invalid phone number')
  ],
  validate,
  authController.sendOTP
);

// Verify OTP
router.post('/verify-otp',
  authLimiter,
  [
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('otp').notEmpty().withMessage('OTP is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  validate,
  authController.verifyOTP
);

// Refresh token
router.post('/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  validate,
  authController.refreshToken
);

module.exports = router;

