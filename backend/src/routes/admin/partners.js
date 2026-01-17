const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminPartnerController = require('../../controllers/adminPartnerController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

// Get all partners
router.get('/', authenticateAdmin, adminPartnerController.getAllPartners);

// Get single partner
router.get('/:id', authenticateAdmin, adminPartnerController.getPartner);

// Create partner
router.post('/',
  authenticateAdmin,
  checkPermission('partners:create', 'partners:*'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required')
      .matches(/^[0-9]{10}$/).withMessage('Invalid phone number'),
    body('vehicleType').isIn(['bike', 'scooter', 'van', 'bicycle']).withMessage('Invalid vehicle type')
  ],
  validate,
  adminPartnerController.createPartner
);

// Update partner
router.put('/:id',
  authenticateAdmin,
  checkPermission('partners:update', 'partners:*'),
  adminPartnerController.updatePartner
);

// Delete partner
router.delete('/:id',
  authenticateAdmin,
  checkPermission('partners:delete', 'partners:*'),
  adminPartnerController.deletePartner
);

// Update partner status
router.patch('/:id/status',
  authenticateAdmin,
  checkPermission('partners:update', 'partners:*'),
  [
    body('status').isIn(['available', 'busy', 'offline']).withMessage('Invalid status')
  ],
  validate,
  adminPartnerController.updatePartnerStatus
);

// Update partner location (for simulation)
router.patch('/:id/location',
  authenticateAdmin,
  [
    body('longitude').isNumeric().withMessage('Longitude is required'),
    body('latitude').isNumeric().withMessage('Latitude is required')
  ],
  validate,
  adminPartnerController.updatePartnerLocation
);

module.exports = router;

