// src/controllers/transactionController.js
const TransactionService = require('../services/transactionService');

class TransactionController {
    async depot(req, res) {
        try {
            const { clientTelephone, amount, agentId } = req.body;

            if (!clientTelephone || !amount || !agentId) {
                return res.status(400).json({
                    success: false,
                    message: "Toutes les informations sont requises"
                });
            }

            const result = await TransactionService.createDepot(
                clientTelephone,
                amount,
                agentId
            );

            // Format de réponse selon le swagger
            return res.status(200).json({
                message: "Dépôt effectué avec succès",
                client: {
                    nom: result.client.nom,
                    prenom: result.client.prenom,
                    telephone: result.client.telephone,
                    nouveauSolde: result.client.nouveauSolde
                },
                agent: {
                    nom: result.agent.nom,
                    commissionAccumulee: result.agent.commissionsAccumulees
                }
            });

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async retrait(req, res) {
        try {
            const { clientTelephone, amount, agentId } = req.body;

            if (!clientTelephone || !amount || !agentId) {
                return res.status(400).json({
                    message: "Toutes les informations sont requises"
                });
            }

            const result = await TransactionService.createRetrait(
                clientTelephone,
                amount,
                agentId
            );

            // Format de réponse selon le swagger
            return res.status(200).json({
                message: "Retrait effectué avec succès",
                client: {
                    nom: result.client.nom,
                    prenom: result.client.prenom,
                    telephone: result.client.telephone,
                    nouveauSolde: result.client.nouveauSolde
                }
            });

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async handleWebhook(req, res) {
        try {
            const { transactionId, status, amount, userId, agentId } = req.body;
            
            await TransactionService.updateTransactionStatus(
                transactionId,
                status,
                { amount, userId, agentId }
            );

            // Format de réponse selon le swagger
            return res.status(200).json({
                message: "Webhook reçu avec succès",
                transactionStatus: status
            });

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async getTransactionStatus(req, res) {
        try {
            const { id } = req.params;
            
            const transaction = await TransactionService.getTransactionById(id);
            
            // Format de réponse selon le swagger
            return res.status(200).json({
                transactionId: transaction._id,
                status: transaction.status,
                amount: transaction.montant,
                userId: transaction.utilisateurSource || transaction.utilisateurDestination,
                agentId: transaction.agent
            });

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }
}

module.exports = new TransactionController();