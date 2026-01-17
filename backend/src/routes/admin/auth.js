const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminAuthController = require('../../controllers/adminAuthController');
const { authenticateAdmin } = require('../../middlewares/auth');
const { authLimiter } = require('../../middlewares/rateLimit');
const validate = require('../../middlewares/validate');

// Admin login
router.post('/login',
  authLimiter,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  adminAuthController.login
);

// Admin logout
router.post('/logout', authenticateAdmin, adminAuthController.logout);

// Get admin profile
router.get('/me', authenticateAdmin, adminAuthController.getMe);

// Update admin profile
router.put('/profile',
  authenticateAdmin,
  [
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  validate,
  adminAuthController.updateProfile
);

// Change password
router.post('/change-password',
  authenticateAdmin,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validate,
  adminAuthController.changePassword
);

module.exports = router;

