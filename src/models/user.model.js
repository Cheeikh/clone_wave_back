const mongoose = require('mongoose');

// Ajouter dans le schéma utilisateur
const userSchema = new mongoose.Schema({
  // ... autres champs
  selectedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  // ... autres champs
}); 