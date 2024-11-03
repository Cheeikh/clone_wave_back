const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

// Validation du QR code
router.post('/validate', authMiddleware, async (req, res) => {
    try {
        const qrData = req.body;
        
        // Vérifier si les données requises sont présentes
        if (!qrData.userId || !qrData.phone || !qrData.timestamp || !qrData.expiresIn) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données QR invalides' 
            });
        }

        // Vérifier si le QR code n'a pas expiré
        const currentTime = new Date().getTime();
        const expirationTime = qrData.timestamp + (qrData.expiresIn * 1000);
        
        if (currentTime > expirationTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'QR code expiré' 
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findById(qrData.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }

        // Vérifier si le numéro de téléphone correspond
        if (user.telephone !== qrData.phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données QR invalides' 
            });
        }

        res.json({ 
            success: true, 
            message: 'QR code valide',
            data: {
                userId: user._id,
                phone: user.telephone,
                nom: user.nom,
                prenom: user.prenom
            }
        });

    } catch (error) {
        console.error('Erreur lors de la validation du QR code:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la validation du QR code' 
        });
    }
});

// Traitement du transfert via QR
router.post('/transfer', authMiddleware, async (req, res) => {
    try {
        const { sourceUserId, amount, description, pin } = req.body;
        const destinationUserId = req.user.id; // L'utilisateur qui scanne

        // Vérifier les données requises
        if (!sourceUserId || !amount || !pin) {
            return res.status(400).json({
                success: false,
                message: 'Données manquantes'
            });
        }

        // Vérifier l'utilisateur source
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

        // Créer la transaction
        const transaction = new Transaction({
            type: 'transfer',
            montant: amount,
            description: description || 'Transfert via QR',
            utilisateurSource: sourceUserId,
            utilisateurDestination: destinationUserId,
            status: 'completed'
        });
        await transaction.save();

        res.json({
            success: true,
            message: 'Transfert effectué avec succès',
            transaction: transaction
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