const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', categoryController.getCategories);

// Get category by slug
router.get('/:slug', categoryController.getCategoryBySlug);

module.exports = router;

