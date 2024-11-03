const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/userModel');

// Validation d'un QR code
router.post('/validate', auth, async (req, res) => {
    try {
        const { userId, phone, timestamp, expiresIn } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si le numéro de téléphone correspond
        if (user.telephone !== phone) {
            return res.status(400).json({
                success: false,
                message: 'Données QR invalides'
            });
        }

        // Vérifier si le QR code n'a pas expiré
        const currentTime = Date.now();
        const expirationTime = timestamp + (expiresIn * 1000); // Convertir en millisecondes

        if (currentTime > expirationTime) {
            return res.status(400).json({
                success: false,
                message: 'QR code expiré'
            });
        }

        res.json({
            success: true,
            message: 'QR code valide'
        });

    } catch (error) {
        console.error('Erreur lors de la validation du QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation du QR code'
        });
    }
});

// Route pour le transfert via QR
router.post('/transfer', auth, async (req, res) => {
    try {
        const { sourceUserId, amount, description, pin } = req.body;
        const destinationUserId = req.user._id; // L'utilisateur authentifié qui scanne

        // Vérifier si l'utilisateur source existe
        const sourceUser = await User.findById(sourceUserId);
        if (!sourceUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur source non trouvé'
            });
        }

        // Vérifier le PIN
        if (sourceUser.pinCode !== pin) {
            return res.status(400).json({
                success: false,
                message: 'Code PIN incorrect'
            });
        }

        // Vérifier le solde
        if (sourceUser.solde < amount) {
            return res.status(400).json({
                success: false,
                message: 'Solde insuffisant'
            });
        }

        // Effectuer le transfert
        sourceUser.solde -= amount;
        await sourceUser.save();

        const destinationUser = await User.findById(destinationUserId);
        destinationUser.solde += amount;
        await destinationUser.save();

        res.json({
            success: true,
            message: 'Transfert effectué avec succès'
        });

    } catch (error) {
        console.error('Erreur lors du transfert via QR:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du transfert'
        });
    }
});

module.exports = router; 