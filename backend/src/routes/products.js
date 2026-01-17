const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getProducts);

// Search products
router.get('/search', productController.searchProducts);

// Get products by IDs (for cart, orders)
router.get('/by-ids', productController.getProductsByIds);

// Get products by category
router.get('/category/:categorySlug', productController.getProductsByCategory);

// Get product recommendations
router.get('/recommendations/:productId', productController.getRecommendations);

// Get product by slug (must be last)
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
