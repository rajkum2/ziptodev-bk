const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../../controllers/adminAnalyticsController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');

// Export reports
router.get('/export',
  authenticateAdmin,
  checkPermission('reports:export', 'reports:*'),
  adminAnalyticsController.exportReports
);

module.exports = router;

