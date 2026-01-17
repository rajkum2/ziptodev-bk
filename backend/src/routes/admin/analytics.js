const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../../controllers/adminAnalyticsController');
const { authenticateAdmin } = require('../../middlewares/auth');

// Dashboard overview
router.get('/overview', authenticateAdmin, adminAnalyticsController.getOverview);

// Sales analytics
router.get('/sales', authenticateAdmin, adminAnalyticsController.getSalesAnalytics);

// Product analytics
router.get('/products', authenticateAdmin, adminAnalyticsController.getProductAnalytics);

// Category analytics
router.get('/categories', authenticateAdmin, adminAnalyticsController.getCategoryAnalytics);

// User analytics
router.get('/users', authenticateAdmin, adminAnalyticsController.getUserAnalytics);

module.exports = router;

