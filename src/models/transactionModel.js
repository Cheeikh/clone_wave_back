import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const transactionSchema = new Schema({
    montant: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                // Le montant doit être supérieur ou égal à 5
                return value >= 5;
            },
            message: 'Le montant de transfert doit être supérieur ou égal à 5.'
        }
    },
    type: {
        type: String,
        enum: ['Envoi', 'Retrait', 'Transfert'],
        required: true
    },
    utilisateurSource: { type: Schema.Types.ObjectId, ref: 'User' }, // Client émetteur
    utilisateurDestination: { type: Schema.Types.ObjectId, ref: 'User' }, // Client récepteur ou agent
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' }, // Référence si un agent est impliqué
    etat: { type: String, enum: ['Success', 'échec'] },
    frais: { type: Number, default: 0 }, // Calculé dynamiquement
    commission: { type: Number, default: 0 }, // Calculé dynamiquement
    cotaDepots: { type: Number, default: 0 }, // Montant total des dépôts journaliers pour vérifier le quota
    creeLe: { type: Date, default: Date.now },
    modifieLe: { type: Date, default: Date.now },
});

// Utilise export default pour l'exportation
export default mongoose.model('Transaction', transactionSchema);
