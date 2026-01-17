const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminLocationController = require('../../controllers/adminLocationController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

// Get all locations
router.get('/', authenticateAdmin, adminLocationController.getAllLocations);

// Get single location
router.get('/:id', authenticateAdmin, adminLocationController.getLocation);

// Create location
router.post('/',
  authenticateAdmin,
  checkPermission('locations:create', 'locations:*'),
  [
    body('pincode').notEmpty().withMessage('Pincode is required')
      .matches(/^[0-9]{6}$/).withMessage('Invalid pincode'),
    body('area').notEmpty().withMessage('Area is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required')
  ],
  validate,
  adminLocationController.createLocation
);

// Update location
router.put('/:id',
  authenticateAdmin,
  checkPermission('locations:update', 'locations:*'),
  adminLocationController.updateLocation
);

// Delete location
router.delete('/:id',
  authenticateAdmin,
  checkPermission('locations:delete', 'locations:*'),
  adminLocationController.deleteLocation
);

module.exports = router;

