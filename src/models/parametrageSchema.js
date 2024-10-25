import mongoose from 'mongoose';

const parametrageSchema = new mongoose.Schema({
    typeTransaction: { type: String, enum: ['Envoi', 'Retrait', 'Transfert'], required: true },
    tauxFrais: { type: Number, required: true, default: 1 }, // Taux de 1% appliqué
    fraisMax: { type: Number, required: true, default: 5000 }, // Limite maximale des frais
    fraisRetraitSiDepassementCota: { type: Number, default: 1 }, // Taux de frais de retrait après dépassement de quota (en %)
    cotaGratuitDepots: { type: Number, default: 20000 }, // Quota maximum avant frais de retrait
    commission: { type: Number, required: true, default: 0 }, // Commission pour l'entreprise
    modifieLe: { type: Date, default: Date.now },
});


// Utilise export default pour exporter le modèle
export default mongoose.model('Parameter', parametrageSchema);
