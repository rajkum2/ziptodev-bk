const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const locationController = require('../controllers/locationController');
const validate = require('../middlewares/validate');

// Check serviceability
router.post('/check',
  [
    body('pincode').notEmpty().withMessage('Pincode is required')
      .matches(/^[0-9]{6}$/).withMessage('Invalid pincode')
  ],
  validate,
  locationController.checkServiceability
);

// Get serviceable locations
router.get('/serviceable', locationController.getServiceableLocations);

module.exports = router;

