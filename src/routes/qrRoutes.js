const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const QRController = require('../controllers/qrController');

// Route pour valider un QR code
router.post('/validate', auth, QRController.validateQRCode);

// Route pour traiter un transfert via QR
router.post('/transfer', auth, QRController.processQRTransfer);

module.exports = router; 