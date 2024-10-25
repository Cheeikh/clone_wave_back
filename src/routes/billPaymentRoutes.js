// src/routes/billPaymentRoutes.js
const express = require('express');
const router = express.Router();
const billPaymentController = require('../controllers/billPaymentController');

// Route pour initier un paiement de facture
router.post('/initiate', billPaymentController.initiateBillPayment);

// Route pour vérifier le statut d'un paiement
router.get('/status/:billPaymentId', billPaymentController.getBillPaymentStatus);

// Route pour valider et finaliser un paiement
router.post('/validate/:billPaymentId', billPaymentController.validateBillPayment);

// Route pour obtenir l'historique des paiements d'un utilisateur
router.get('/history', billPaymentController.getUserBillPayments);

// Route pour annuler un paiement en attente
router.post('/cancel/:billPaymentId', billPaymentController.cancelBillPayment);

module.exports = router;