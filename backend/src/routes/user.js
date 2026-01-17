const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Get user profile
router.get('/profile', authenticateUser, authController.getProfile);

// Update user profile
router.put('/profile',
  authenticateUser,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email')
  ],
  validate,
  authController.updateProfile
);

// Add address
router.post('/addresses',
  authenticateUser,
  [
    body('addressLine1').notEmpty().withMessage('Address line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('pincode').notEmpty().withMessage('Pincode is required')
      .matches(/^[0-9]{6}$/).withMessage('Invalid pincode')
  ],
  validate,
  authController.addAddress
);

// Update address
router.put('/addresses/:addressId', authenticateUser, authController.updateAddress);

// Delete address
router.delete('/addresses/:addressId', authenticateUser, authController.deleteAddress);

module.exports = router;

