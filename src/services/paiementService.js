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

            // Vérification de l'existence de l'utilisateur et du service
            if (!utilisateur) {
                throw new Error('Utilisateur non trouvé');
            }
            if (!service) {
                throw new Error('Service non trouvé');
            }

            // Vérification détaillée du solde
            if (utilisateur.solde < service.prix) {
                const soldeManquant = service.prix - utilisateur.solde;
                const error = new Error('Solde insuffisant');
                error.details = {
                    soldeActuel: utilisateur.solde,
                    prixService: service.prix,
                    soldeManquant: soldeManquant,
                    message: `Votre solde actuel est de ${utilisateur.solde}. Il vous manque ${soldeManquant} pour effectuer ce paiement.`
                };
                throw error;
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
            
            // Si c'est une erreur de solde insuffisant, on retourne les détails
            if (error.details) {
                throw {
                    message: error.message,
                    ...error.details,
                    code: 'SOLDE_INSUFFISANT'
                };
            }
            
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