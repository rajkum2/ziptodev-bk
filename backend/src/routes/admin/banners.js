const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminBannerController = require('../../controllers/adminBannerController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

// Get all banners
router.get('/', authenticateAdmin, adminBannerController.getAllBanners);

// Get single banner
router.get('/:id', authenticateAdmin, adminBannerController.getBanner);

// Create banner
router.post('/',
  authenticateAdmin,
  checkPermission('banners:create', 'banners:*'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('image').notEmpty().withMessage('Image is required')
  ],
  validate,
  adminBannerController.createBanner
);

// Update banner
router.put('/:id',
  authenticateAdmin,
  checkPermission('banners:update', 'banners:*'),
  adminBannerController.updateBanner
);

// Delete banner
router.delete('/:id',
  authenticateAdmin,
  checkPermission('banners:delete', 'banners:*'),
  adminBannerController.deleteBanner
);

module.exports = router;

