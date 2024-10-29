const AgentService = require('../services/agentService');
const Agent = require('../models/agentModel');


class AgentController {
    async getCommissions(req, res) {
        try {
            const { id } = req.params;
            
            const result = await AgentService.getAgentCommissions(id);
            
            // Format de réponse selon le swagger
            return res.status(200).json({
                agentId: result.agentId,
                commissions: result.commissions.map(commission => ({
                    transactionId: commission.transactionId,
                    amount: commission.amount,
                    date: commission.date
                })),
                totalCommissions: result.totalCommissions
            });

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }

    async retraitCommission(req, res) {
        try {
            const { agentId, amount } = req.body;
            
            const result = await AgentService.processCommissionWithdrawal(agentId, amount);
            
            // Format de réponse selon le swagger
            return res.status(200).json({
                message: "Retrait de commission effectué avec succès",
                remainingCommissions: result.remainingCommissions
            });

        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }
    }
}

module.exports = new AgentController();