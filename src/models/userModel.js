// src/models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    pinCode: {
        type: String,
        required: true,
    },
    // Ajoutez d'autres champs utilisateur si nécessaire
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
