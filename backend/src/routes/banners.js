const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// Get active banners
router.get('/', bannerController.getBanners);

module.exports = router;

