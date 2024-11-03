const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const { TransactionError } = require('../utils/errors');
const bcrypt = require('bcrypt');

exports.createTransfer = async ({ sourceUserId, phoneNumber, amount, description, pin }) => {
    console.log('Service - Données reçues:', { 
        sourceUserId, 
        phoneNumber, 
        amount, 
        description 
    });

    // Vérifier le solde de l'utilisateur source
    const sourceUser = await User.findById(sourceUserId);
    if (!sourceUser) {
        throw new TransactionError('Utilisateur source non trouvé');
    }

    // Vérifier le PIN
    const isPinValid = await bcrypt.compare(pin, sourceUser.pinCode);
    if (!isPinValid) {
        throw new TransactionError('Code PIN incorrect');
    }

    // Formater le numéro de téléphone
    let formattedPhoneNumber = phoneNumber;
    if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = '+' + formattedPhoneNumber;
    }
    formattedPhoneNumber = formattedPhoneNumber.replace(/\s+/g, '');

    // Trouver l'utilisateur destinataire
    const destinationUser = await User.findOne({ telephone: formattedPhoneNumber });
    if (!destinationUser) {
        throw new TransactionError('Utilisateur destinataire non trouvé');
    }

    // Vérifier que l'utilisateur ne transfère pas à lui-même
    if (sourceUserId === destinationUser._id.toString()) {
        throw new TransactionError('Impossible de transférer à soi-même');
    }

    // Vérifier que le solde est suffisant
    if (sourceUser.solde < amount) {
        throw new TransactionError('Solde insuffisant');
    }

    // Créer la transaction avec le type 'transfert'
    const transaction = new Transaction({
        montant: amount,
        type: 'transfert',
        utilisateurSource: sourceUserId,
        utilisateurDestination: destinationUser._id,
        status: 'terminee',
        description: description || 'Transfert'
    });

    // Mettre à jour les soldes des utilisateurs
    sourceUser.solde -= amount;
    destinationUser.solde += amount;

    // Sauvegarder les modifications dans une transaction MongoDB
    const session = await Transaction.startSession();
    try {
        session.startTransaction();
        
        await transaction.save({ session });
        await sourceUser.save({ session });
        await destinationUser.save({ session });
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    return transaction;
};

exports.getUserTransactions = async (userId) => {
    return Transaction.find({
        $or: [
            { utilisateurSource: userId },
            { utilisateurDestination: userId }
        ]
    })
    .sort({ creeLe: -1 })
    .populate('utilisateurSource utilisateurDestination', 'nom prenom telephone');
};

exports.getTransactionById = async (transactionId, userId) => {
    return Transaction.findOne({
        _id: transactionId,
        $or: [
            { utilisateurSource: userId },
            { utilisateurDestination: userId }
        ]
    })
    .populate('utilisateurSource utilisateurDestination', 'nom prenom telephone');
};
