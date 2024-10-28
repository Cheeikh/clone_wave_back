// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController'); // Correction ici

// Route pour créer un service
router.post('/paiement', paiementController.effectuerPaiement);
router.get('/paiements/:userId', paiementController.getPaiements);

// Exporter le routeur
module.exports = router;
