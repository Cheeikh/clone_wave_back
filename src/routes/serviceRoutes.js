const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');

router.get('/available', authMiddleware, serviceController.getAvailableServices);
router.post('/selected', authMiddleware, serviceController.updateSelectedServices);
router.get('/selected', authMiddleware, serviceController.getSelectedServices);

module.exports = router; 