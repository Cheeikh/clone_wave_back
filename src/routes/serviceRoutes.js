// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Route pour créer un service
router.post('/create', serviceController.createService);

// Exporter le routeur
module.exports = router;
