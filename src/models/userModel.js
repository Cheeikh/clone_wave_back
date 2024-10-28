// src/models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: {type: String, required: true, unique: true,},
    pinCode: {type: String},
    solde: { type: Number, default: 0 },
    roles: [{ type: String, enum: ['utilisateur', 'agent', 'admin'], default: 'utilisateur' }],
    isTelephoneVerifie: { type: Boolean, default: false },
    tokens: [{ type: String }], // Pour stocker les JWT actifs
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
