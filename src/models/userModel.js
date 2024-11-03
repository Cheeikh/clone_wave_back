// src/models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nom: { 
        type: String, 
        required: function() {
            return this.isTelephoneVerifie;
        }
    },
    prenom: { 
        type: String, 
        required: function() {
            return this.isTelephoneVerifie;
        }
    },
    telephone: {
        type: String, 
        required: true, 
        unique: true,
    },
    pinCode: {
        type: String,
        required: function() {
            return this.isTelephoneVerifie;
        }
    },
    solde: { 
        type: Number, 
        default: 0 
    },
    roles: [{ 
        type: String, 
        enum: ['utilisateur', 'agent', 'admin'], 
        default: 'utilisateur' 
    }],
    isTelephoneVerifie: { 
        type: Boolean, 
        default: false 
    },
    tokens: [{ 
        type: String 
    }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
