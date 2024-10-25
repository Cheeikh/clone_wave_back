const mongoose = require('mongoose');
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Paiement = require('../models/paiementModel');

class PaiementService {
    static async effectuerPaiement(userId, serviceId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const utilisateur = await User.findById(userId).session(session);
            const service = await Service.findById(serviceId).session(session);

            if (!utilisateur || !service) {
                throw new Error('Utilisateur ou service non trouvé');
            }

            if (utilisateur.solde < service.prix) {
                throw new Error('Solde insuffisant');
            }

            // Générer une référence unique pour le paiement
            const reference = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // Créer le paiement
            const nouveauPaiement = new Paiement({
                utilisateur: userId,
                service: serviceId,
                montant: service.prix,
                reference
            });

            // Décrémenter le solde de l'utilisateur
            utilisateur.solde -= service.prix;
            await utilisateur.save({ session });
            
            // Sauvegarder le paiement
            nouveauPaiement.statut = 'reussie';
            await nouveauPaiement.save({ session });

            await session.commitTransaction();
            return {
                success: true,
                paiement: nouveauPaiement,
                nouveauSolde: utilisateur.solde
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    static async getPaiementsByUser(userId) {
        return Paiement.find({ utilisateur: userId })
            .populate('service', 'nom prix codeMarchand')
            .sort({ creeLe: -1 });
    }

    static async getPaiementById(paiementId) {
        return Paiement.findById(paiementId)
            .populate('utilisateur', 'nom prenom telephone')
            .populate('service', 'nom prix codeMarchand');
    }
}

module.exports = PaiementService;