const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/userModel');

router.post('/validate', authMiddleware, async (req, res) => {
    try {
        const qrData = req.body;
        
        if (!qrData.userId || !qrData.phone || !qrData.timestamp || !qrData.expiresIn) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données QR invalides' 
            });
        }

        const currentTime = new Date().getTime();
        const expirationTime = qrData.timestamp + (qrData.expiresIn * 1000);
        
        if (currentTime > expirationTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'QR code expiré' 
            });
        }

        const user = await User.findById(qrData.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }

        if (user.telephone !== qrData.phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données utilisateur invalides' 
            });
        }

        res.json({ 
            success: true, 
            message: 'QR code valide',
            isValid: true
        });

    } catch (error) {
        console.error('Erreur lors de la validation du QR code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la validation du QR code' 
        });
    }
});

module.exports = router; 