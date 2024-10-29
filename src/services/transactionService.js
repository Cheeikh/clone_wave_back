const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

class TransactionService {
    async createDepot(clientPhone, amount, agentId) {
        // Vérifier l'existence de l'agent dans la collection users
        const agent = await User.findOne({ 
            _id: agentId,
            roles: 'agent'
        });
        if (!agent) {
            throw new Error('Agent non trouvé');
        }

        // Vérifier l'existence du client
        const client = await User.findOne({ telephone: clientPhone });
        if (!client) {
            throw new Error('Client non trouvé');
        }

        // Calculer la commission (1% du montant)
        const commissionRate = 0.01;
        const commission = amount * commissionRate;

        // Créer la transaction
        const transaction = new Transaction({
            montant: amount,
            type: 'depot',
            utilisateurDestination: client._id,
            agent: agentId,
            status: 'en_attente',
            commission: commission,
            fraisTransaction: 0,
        });

        // Sauvegarder la transaction
        await transaction.save();

        // Mettre à jour le solde du client
        await User.findByIdAndUpdate(
            client._id,
            { $inc: { solde: amount } }
        );

        // Mettre à jour les commissions de l'agent
        await User.findByIdAndUpdate(
            agentId,
            { $inc: { solde: commission } }
        );

        // Marquer la transaction comme terminée
        transaction.status = 'terminee';
        await transaction.save();

        // Récupérer les informations mises à jour
        const updatedClient = await User.findById(client._id);
        const updatedAgent = await User.findById(agentId);

        return {
            transaction: transaction,
            client: {
                nom: updatedClient.nom,
                prenom: updatedClient.prenom,
                telephone: updatedClient.telephone,
                nouveauSolde: updatedClient.solde
            },
            agent: {
                nom: updatedAgent.nom,
                commissionAccumulee: updatedAgent.solde
            }
        };
    }

    async createRetrait(clientPhone, amount, agentId) {
        // Vérifier l'existence de l'agent dans la collection users
        const agent = await User.findOne({ 
            _id: agentId,
            roles: 'agent'
        });
        if (!agent) {
            throw new Error('Agent non trouvé');
        }

        // Vérifier l'existence du client
        const client = await User.findOne({ telephone: clientPhone });
        if (!client) {
            throw new Error('Client non trouvé');
        }

        // Vérifier si le client a suffisamment de solde
        if (client.solde < amount) {
            throw new Error('Solde insuffisant');
        }

        // Calculer la commission (1% du montant)
        const commissionRate = 0.01;
        const commission = amount * commissionRate;

        // Créer la transaction
        const transaction = new Transaction({
            montant: amount,
            type: 'retrait',
            utilisateurSource: client._id,
            agent: agentId,
            status: 'en_attente',
            commission: commission,
            fraisTransaction: 0
        });

        await transaction.save();

        // Mettre à jour le solde du client
        await User.findByIdAndUpdate(
            client._id,
            { $inc: { solde: -amount } }
        );

        // Mettre à jour les commissions de l'agent
        await User.findByIdAndUpdate(
            agentId,
            { $inc: { solde: commission } }
        );

        // Marquer la transaction comme terminée
        transaction.status = 'terminee';
        await transaction.save();

        // Récupérer les informations mises à jour
        const updatedClient = await User.findById(client._id);
        const updatedAgent = await User.findById(agentId);

        return {
            message: "Retrait effectué avec succès",
            client: {
                nom: updatedClient.nom,
                prenom: updatedClient.prenom,
                telephone: updatedClient.telephone,
                nouveauSolde: updatedClient.solde
            }
        };
    }

    async getTransactionById(transactionId) {
        const transaction = await Transaction.findById(transactionId)
            .populate('utilisateurSource', 'nom prenom telephone')
            .populate('utilisateurDestination', 'nom prenom telephone')
            .populate('agent', 'nom prenom');

        if (!transaction) {
            throw new Error('Transaction non trouvée');
        }

        return transaction;
    }

    async updateTransactionStatus(transactionId, status, details) {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction non trouvée');
        }

        transaction.status = status;
        transaction.modifieLe = new Date();
        await transaction.save();

        return transaction;
    }
}

module.exports = new TransactionService();