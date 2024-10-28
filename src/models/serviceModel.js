// src/models/serviceModel.js

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String },
    prix: { type: Number, required: true },
    qrCode: { type: String },
    codeMarchand: { type: String, unique: true, required: true }, // Code marchand unique
    creeLe: { type: Date, default: Date.now },
    modifieLe: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
