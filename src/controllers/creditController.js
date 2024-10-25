/* const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');
const { validatePhoneNumber } = require('../utils/operatorUtils');


const creditController = {
  achatCredit: async (req, res) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
          // Vérification de l'authentification
          if (!req.user || !req.user._id) {
              await session.abortTransaction();
              return res.status(401).json({
                  success: false,
                  message: 'Utilisateur non authentifié'
              });
          }

          const errors = validationResult(req);
          if (!errors.isEmpty()) {
              await session.abortTransaction();
              return res.status(400).json({
                  success: false,
                  errors: errors.array()
              });
          }

          const { phoneNumber, amount } = req.body;
          const userId = req.user._id;

          // Validation du numéro de téléphone
          const validation = validatePhoneNumber(phoneNumber);
          if (!validation.isValid) {
              await session.abortTransaction();
              return res.status(400).json({
                  success: false,
                  message: validation.errors.join('. ')
              });
          }

          // Récupérer l'utilisateur avec le bon ID
          const user = await User.findById(userId).session(session);
          if (!user) {
              await session.abortTransaction();
              return res.status(404).json({
                  success: false,
                  message: 'Utilisateur non trouvé'
              });
          }

          // Vérifier le solde
          if (user.solde < amount) {
              await session.abortTransaction();
              return res.status(400).json({
                  success: false,
                  message: 'Solde insuffisant pour effectuer cet achat'
              });
          }

          // Mettre à jour le solde
          user.solde -= amount;
          await user.save({ session });

          // Créer la transaction
          const transaction = await Transaction.create([{
              montant: amount,
              type: 'debit',
              utilisateurSource: userId,
              status: 'terminee',
              description: `Achat de crédit ${validation.operator} pour ${phoneNumber}`,
              creeLe: new Date(),
              modifieLe: new Date(),
              metadonnees: {
                  operateur: validation.operator,
                  numeroBeneficiaire: phoneNumber
              }
          }], { session });

          await session.commitTransaction();

          return res.json({
              success: true,
              message: `Crédit ${validation.operator} de ${amount} FCFA acheté avec succès pour le numéro ${phoneNumber}`,
              details: {
                  montant: amount,
                  nouveauSolde: user.solde,
                  numeroBeneficiaire: phoneNumber,
                  operateur: validation.operator
              },
              transactionId: transaction[0]._id
          });

      } catch (error) {
          console.error('Erreur lors de l\'achat de crédit:', error);
          await session.abortTransaction();
          return res.status(500).json({
              success: false,
              message: 'Une erreur est survenue lors de l\'achat du crédit'
          });
      } finally {
          session.endSession();
      }
  }
};

module.exports = creditController; */

const { validationResult } = require('express-validator');
const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');
const { validatePhoneNumber } = require('../utils/operatorUtils');

const creditController = {
  achatCredit: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { phoneNumber, amount } = req.body;

      // Initialiser un solde quelconque et un utilisateur factice pour le test
      const user = {
        solde: 10000, // solde initial pour le test
        _id: new mongoose.Types.ObjectId() // ID utilisateur factice pour le test
      };

      // Validation du numéro de téléphone
      const validation = validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: validation.errors.join('. ')
        });
      }

      // Vérifier le solde
      if (user.solde < amount) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Solde insuffisant pour effectuer cet achat'
        });
      }

      // Mettre à jour le solde pour le test
      user.solde -= amount;

      // Créer la transaction avec l'ID utilisateur factice
      const transaction = await Transaction.create([{
        montant: amount,
        type: 'debit',
        utilisateurSource: user._id,
        status: 'terminee',
        description: `Achat de crédit ${validation.operator} pour ${phoneNumber}`,
        creeLe: new Date(),
        modifieLe: new Date(),
        metadonnees: {
          operateur: validation.operator,
          numeroBeneficiaire: phoneNumber
        }
      }], { session });

      await session.commitTransaction();

      return res.json({
        success: true,
        message: `Crédit ${validation.operator} de ${amount} FCFA acheté avec succès pour le numéro ${phoneNumber}`,
        details: {
          montant: amount,
          nouveauSolde: user.solde,
          numeroBeneficiaire: phoneNumber,
          operateur: validation.operator
        },
        transactionId: transaction[0]._id
      });

    } catch (error) {
      console.error('Erreur lors de l\'achat de crédit:', error);
      await session.abortTransaction();
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de l\'achat du crédit'
      });
    } finally {
      session.endSession();
    }
  }
};

module.exports = creditController;
