const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminShelfController = require('../../controllers/adminShelfController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

// Get all shelves
router.get('/', authenticateAdmin, adminShelfController.getAllShelves);

// Get single shelf
router.get('/:id', authenticateAdmin, adminShelfController.getShelf);

// Create shelf
router.post('/',
  authenticateAdmin,
  checkPermission('shelves:create', 'shelves:*'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').isIn(['featured', 'category', 'tag-based', 'manual']).withMessage('Invalid type')
  ],
  validate,
  adminShelfController.createShelf
);

// Update shelf
router.put('/:id',
  authenticateAdmin,
  checkPermission('shelves:update', 'shelves:*'),
  adminShelfController.updateShelf
);

// Delete shelf
router.delete('/:id',
  authenticateAdmin,
  checkPermission('shelves:delete', 'shelves:*'),
  adminShelfController.deleteShelf
);

module.exports = router;

