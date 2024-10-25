const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    montant: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit', 'depot', 'retrait'], required: true },
    utilisateurSource: { type: Schema.Types.ObjectId, ref: 'User' },
    utilisateurDestination: { type: Schema.Types.ObjectId, ref: 'User' },
    agent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: { type: String, enum: ['en_attente', 'terminee', 'echouee'], default: 'en_attente' },
    fraisTransaction: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    creeLe: { type: Date, default: Date.now },
    modifieLe: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
