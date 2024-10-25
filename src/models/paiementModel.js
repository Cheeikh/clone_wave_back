
const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    montant: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        enum: ['en_cours', 'reussie', 'echouee'],
        default: 'en_cours'
    },
    reference: {
        type: String,
        unique: true
    },
    creeLe: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Paiement', paiementSchema);