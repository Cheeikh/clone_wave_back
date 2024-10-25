// src/models/billPaymentModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const billPaymentSchema = new Schema({
    utilisateur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fournisseur: { type: String, required: true },
    montant: { type: Number, required: true },
    status: { type: String, enum: ['en_attente', 'terminee', 'echouee'], default: 'en_attente' },
    transaction: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    creeLe: { type: Date, default: Date.now },
    modifieLe: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BillPayment', billPaymentSchema);