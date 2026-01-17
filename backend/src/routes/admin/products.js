const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminProductController = require('../../controllers/adminProductController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const { upload, handleUploadError } = require('../../middlewares/upload');
const validate = require('../../middlewares/validate');

// Get all products
router.get('/', authenticateAdmin, adminProductController.getAllProducts);

// Get single product
router.get('/:id', authenticateAdmin, adminProductController.getProduct);

// Create product
router.post('/',
  authenticateAdmin,
  checkPermission('products:create', 'products:*'),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('variants').isArray({ min: 1 }).withMessage('At least one variant is required')
  ],
  validate,
  adminProductController.createProduct
);

// Update product
router.put('/:id',
  authenticateAdmin,
  checkPermission('products:update', 'products:*'),
  adminProductController.updateProduct
);

// Delete product
router.delete('/:id',
  authenticateAdmin,
  checkPermission('products:delete', 'products:*'),
  adminProductController.deleteProduct
);

// Upload product images
router.post('/:id/upload-images',
  authenticateAdmin,
  checkPermission('products:update', 'products:*'),
  upload.array('images', 5),
  handleUploadError,
  adminProductController.uploadImages
);

// Bulk import
router.post('/bulk-import',
  authenticateAdmin,
  checkPermission('products:create', 'products:*'),
  adminProductController.bulkImport
);

module.exports = router;

