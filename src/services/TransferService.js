import User from '../models/userModel.js'; // Assurez-vous d'importer avec .js
import Parameter from '../models/parametrageSchema.js'; // Assurez-vous d'importer avec .js
import Transaction from '../models/transactionModel.js'; // Assurez-vous d'importer avec .js

class TransferService {
    async transfertEntreClients(utilisateurSource, utilisateurDestination, montant) {
        console.log("Recherche de l'utilisateur émetteur avec l'ID:", utilisateurSource);
        const emetteur = await User.findById(utilisateurSource);

        if (!emetteur) {
            console.error(`Utilisateur émetteur introuvable avec l'ID: ${utilisateurSource}`);
            throw new Error("Utilisateur émetteur introuvable.");
        }

        console.log("Utilisateur émetteur trouvé:", emetteur);

        // Vérifiez le solde de l'émetteur
        if (emetteur.solde < montant) {
            throw new Error("Solde insuffisant.");
        }

        const destinataire = await User.findById(utilisateurDestination);
        if (!destinataire) {
            throw new Error("Destinataire introuvable.");
        }

        const parametres = await Parameter.findOne({ typeTransaction: 'Transfert' });
        if (!parametres) {
            throw new Error("Paramètres de transfert introuvables.");
        }

        // Calcul des frais
        const frais = Math.min((montant * parametres.tauxFrais) / 100, parametres.fraisMax);

        // Mise à jour des soldes
        emetteur.solde -= (montant + frais);
        destinataire.solde += montant;

        await emetteur.save();
        await destinataire.save();

        // Enregistrement de la transaction
        return await Transaction.create({
            utilisateurSource,
            utilisateurDestination,
            montant,
            type: 'Transfert',
            frais,
            etat: 'Success',
        });
    }
}

export default new TransferService(); // Utilise export default pour l'exportation
