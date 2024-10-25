// src/controllers/billPaymentController.js
const { default: mongoose } = require('mongoose');
const BillPayment = require('../models/billPaymentModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Initialiser un utilisateur de test
const testUser = {
   _id: new mongoose.Types.ObjectId(),
   telephone: '773285307',
   solde: 100000,
   pinCode: bcrypt.hashSync('1234', 10),
};

// Initier un paiement de facture
exports.initiateBillPayment = async (req, res) => {
   try {
       const { telephone, pinCode, fournisseur, montant } = req.body;

       // Vérifier si le solde est suffisant
       if (testUser.solde < montant) {
           return res.status(400).json({ message: 'Solde insuffisant' });
       }

       // Créer le paiement de facture
       const billPayment = new BillPayment({
           utilisateur: testUser._id,
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

       // Simuler un paiement
       const billPayment = {
           _id: billPaymentId,
           utilisateur: testUser._id,
           fournisseur: 'SENELEC',
           montant: 5000,
           status: 'en_attente',
           creeLe: new Date()
       };

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

       // Vérifier le PIN
       const isMatch = await bcrypt.compare(pinCode, testUser.pinCode);
       if (!isMatch) {
           return res.status(401).json({ message: 'Code PIN invalide' });
       }

       // Simuler un paiement en attente
       const billPayment = {
           _id: billPaymentId,
           utilisateur: testUser._id,
           fournisseur: 'SENELEC',
           montant: 5000,
           status: 'en_attente',
           modifieLe: new Date()
       };

       // Mettre à jour le solde simulé
       testUser.solde -= billPayment.montant;

       // Simuler la validation du paiement
       billPayment.status = 'terminee';
       billPayment.modifieLe = Date.now();

       res.status(200).json({
           message: 'Paiement validé avec succès',
           nouveauSolde: testUser.solde,
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

       // Simuler une liste de paiements
       const payments = [
           {
               _id: new mongoose.Types.ObjectId(),
               utilisateur: testUser._id,
               fournisseur: 'SENELEC',
               montant: 5000,
               status: 'terminee',
               creeLe: new Date('2024-10-24')
           },
           {
               _id: new mongoose.Types.ObjectId(),
               utilisateur: testUser._id,
               fournisseur: 'SDE',
               montant: 3000,
               status: 'en_attente',
               creeLe: new Date('2024-10-25')
           }
       ];

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

       // Vérifier le PIN
       const isMatch = await bcrypt.compare(pinCode, testUser.pinCode);
       if (!isMatch) {
           return res.status(401).json({ message: 'Code PIN invalide' });
       }

       // Simuler un paiement en attente
       const billPayment = {
           _id: billPaymentId,
           utilisateur: testUser._id,
           status: 'en_attente'
       };

       billPayment.status = 'echouee';
       billPayment.modifieLe = Date.now();

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