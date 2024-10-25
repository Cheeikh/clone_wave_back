const PaiementService = require('../services/paiementService');

const paiementController = {
    async effectuerPaiement(req, res) {
        try {
            const { userId, serviceId } = req.body;
            const resultat = await PaiementService.effectuerPaiement(userId, serviceId);
            
            res.status(200).json({
                success: true,
                message: 'Paiement effectué avec succès',
                data: resultat
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async getPaiements(req, res) {
        try {
            const { userId } = req.params;
            const paiements = await PaiementService.getPaiementsByUser(userId);
            
            res.status(200).json({
                success: true,
                data: paiements
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = paiementController;