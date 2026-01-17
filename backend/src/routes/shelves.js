const express = require('express');
const router = express.Router();
const shelfController = require('../controllers/shelfController');

// Get active shelves
router.get('/', shelfController.getShelves);

module.exports = router;

