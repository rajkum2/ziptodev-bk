const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminCategoryController = require('../../controllers/adminCategoryController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

// Get all categories
router.get('/', authenticateAdmin, adminCategoryController.getAllCategories);

// Get single category
router.get('/:id', authenticateAdmin, adminCategoryController.getCategory);

// Create category
router.post('/',
  authenticateAdmin,
  checkPermission('categories:create', 'categories:*'),
  [
    body('name').notEmpty().withMessage('Category name is required')
  ],
  validate,
  adminCategoryController.createCategory
);

// Update category
router.put('/:id',
  authenticateAdmin,
  checkPermission('categories:update', 'categories:*'),
  adminCategoryController.updateCategory
);

// Delete category
router.delete('/:id',
  authenticateAdmin,
  checkPermission('categories:delete', 'categories:*'),
  adminCategoryController.deleteCategory
);

// Reorder categories
router.patch('/reorder',
  authenticateAdmin,
  checkPermission('categories:update', 'categories:*'),
  [
    body('categories').isArray().withMessage('Categories array is required')
  ],
  validate,
  adminCategoryController.reorderCategories
);

module.exports = router;

