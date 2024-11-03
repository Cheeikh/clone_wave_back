const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ... autres champs ...
  pin: {
    type: String,
    required: true
  }
});

userSchema.methods.comparePin = async function(pin) {
  // Vous pouvez implémenter une comparaison sécurisée du PIN ici
  // Pour l'exemple, on fait une comparaison simple
  return this.pin === pin;
};

module.exports = mongoose.model('User', userSchema); 