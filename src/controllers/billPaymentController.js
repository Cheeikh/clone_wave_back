// src/controllers/billPaymentController.js
const { default: mongoose } = require('mongoose');
const BillPayment = require('../models/billPaymentModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Initier un paiement de facture
exports.initiateBillPayment = async (req, res) => {
    try {
        const { telephone, pinCode, fournisseur, montant } = req.body;

        // Vérifier l'utilisateur
        // const user = await User.findOne({ telephone });
        // if (!user) {
        //     return res.status(401).json({ message: 'Utilisateur non trouvé' });
        // }

        // // Vérifier le code PIN
        // const isMatch = await bcrypt.compare(pinCode, user.pinCode);
        // if (!isMatch) {
        //     return res.status(401).json({ message: 'Code PIN invalide' });
        // }

        const user = {
            _id: new mongoose.Types.ObjectId(),
            telephone: '773285307',
            solde :100000,
            //pin with bcrypt
            pinCode: bcrypt.hashSync('1234', 10),
        };

        // Vérifier si le solde est suffisant
        if (user.solde < montant) {
            return res.status(400).json({ message: 'Solde insuffisant' });
        }

        // Créer le paiement de facture
        const billPayment = new BillPayment({
            utilisateur: user._id,
            fournisseur,
            montant,
            status: 'en_attente'
        });

        await billPayment.save();

        res.status(201).json({
            message: 'Paiement initié avec succès',
            billPayment: {
                id: billPayment._id,
                fournisseur: billPayment.fournisseur,
                montant: billPayment.montant,
                status: billPayment.status
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'initiation du paiement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Vérifier le statut d'un paiement
exports.getBillPaymentStatus = async (req, res) => {
    try {
        const { billPaymentId } = req.params;
        const { telephone } = req.body;

        // Vérifier que l'utilisateur existe
        const user = await User.findOne({ telephone });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Rechercher le paiement
        const billPayment = await BillPayment.findOne({
            _id: billPaymentId,
            utilisateur: user._id
        });

        if (!billPayment) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        res.status(200).json({
            status: billPayment.status,
            fournisseur: billPayment.fournisseur,
            montant: billPayment.montant,
            creeLe: billPayment.creeLe
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Valider et finaliser un paiement
exports.validateBillPayment = async (req, res) => {
    try {
        const { billPaymentId } = req.params;
        const { telephone, pinCode } = req.body;

        // Vérifier l'utilisateur et son PIN
        const user = await User.findOne({ telephone });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(pinCode, user.pinCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Code PIN invalide' });
        }

        // Rechercher le paiement
        const billPayment = await BillPayment.findOne({
            _id: billPaymentId,
            utilisateur: user._id,
            status: 'en_attente'
        });

        if (!billPayment) {
            return res.status(404).json({ message: 'Paiement non trouvé ou déjà traité' });
        }

        // Vérifier à nouveau le solde
        if (user.solde < billPayment.montant) {
            billPayment.status = 'echouee';
            await billPayment.save();
            return res.status(400).json({ message: 'Solde insuffisant' });
        }

        // Mettre à jour le solde de l'utilisateur
        user.solde -= billPayment.montant;
        await user.save();

        // Mettre à jour le statut du paiement
        billPayment.status = 'terminee';
        billPayment.modifieLe = Date.now();
        await billPayment.save();

        res.status(200).json({
            message: 'Paiement validé avec succès',
            nouveauSolde: user.solde,
            paiement: {
                id: billPayment._id,
                montant: billPayment.montant,
                status: billPayment.status,
                fournisseur: billPayment.fournisseur
            }
        });
    } catch (error) {
        console.error('Erreur lors de la validation du paiement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Obtenir l'historique des paiements d'un utilisateur
exports.getUserBillPayments = async (req, res) => {
    try {
        const { telephone } = req.body;

        // Vérifier l'utilisateur
        const user = await User.findOne({ telephone });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Récupérer tous les paiements de l'utilisateur
        const payments = await BillPayment.find({ utilisateur: user._id })
            .sort({ creeLe: -1 }) // Du plus récent au plus ancien
            .select('-__v'); // Exclure le champ __v

        res.status(200).json({
            count: payments.length,
            payments
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Annuler un paiement en attente
exports.cancelBillPayment = async (req, res) => {
    try {
        const { billPaymentId } = req.params;
        const { telephone, pinCode } = req.body;

        // Vérifier l'utilisateur et son PIN
        const user = await User.findOne({ telephone });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const isMatch = await bcrypt.compare(pinCode, user.pinCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Code PIN invalide' });
        }

        // Rechercher et mettre à jour le paiement
        const billPayment = await BillPayment.findOne({
            _id: billPaymentId,
            utilisateur: user._id,
            status: 'en_attente'
        });

        if (!billPayment) {
            return res.status(404).json({ message: 'Paiement non trouvé ou ne peut pas être annulé' });
        }

        billPayment.status = 'echouee';
        billPayment.modifieLe = Date.now();
        await billPayment.save();

        res.status(200).json({
            message: 'Paiement annulé avec succès',
            paiement: {
                id: billPayment._id,
                status: billPayment.status
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'annulation du paiement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};