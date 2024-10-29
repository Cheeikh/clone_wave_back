const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

class AgentService {
    async getAgentCommissions(agentId) {
        // Chercher l'agent dans la collection users
        const agent = await User.findOne({
            _id: agentId,
            roles: 'agent'
        });
        
        if (!agent) {
            throw new Error('Agent non trouvé');
        }

        // Rechercher toutes les transactions liées à cet agent
        const transactions = await Transaction.find({
            agent: agentId,
            status: 'terminee'
        }).select('_id montant commission creeLe');

        // Calculer le total des commissions
        const totalCommissions = transactions.reduce((sum, t) => sum + (t.commission || 0), 0);

        return {
            agentId: agent._id,
            commissions: transactions.map(t => ({
                transactionId: t._id,
                amount: t.commission,
                date: t.creeLe
            })),
            totalCommissions: totalCommissions
        };
    }

    async processCommissionWithdrawal(agentId, amount) {
        const agent = await User.findOne({
            _id: agentId,
            roles: 'agent'
        });

        if (!agent) {
            throw new Error('Agent non trouvé');
        }

        if (agent.solde < amount) {
            throw new Error('Commissions insuffisantes');
        }

        await User.findByIdAndUpdate(agentId, {
            $inc: { solde: -amount }
        });

        const updatedAgent = await User.findById(agentId);
        return {
            remainingCommissions: updatedAgent.solde
        };
    }
}

module.exports = new AgentService();