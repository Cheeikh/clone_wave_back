const mongoose = require('mongoose');
const User = require('../models/user.model');
const Service = require('../models/service.model');
require('dotenv').config();

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Récupérer les services par défaut (transfer et scan)
    const defaultServices = await Service.find({
      type: { $in: ['transfer', 'scan'] }
    });
    const defaultServiceIds = defaultServices.map(service => service._id);

    // Utiliser le modèle User directement pour la mise à jour
    const result = await mongoose.connection.collection('users').updateMany(
      { selectedServices: { $exists: false } },
      { $set: { selectedServices: defaultServiceIds } }
    );

    console.log(`${result.modifiedCount} utilisateurs mis à jour`);
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');

  } catch (error) {
    console.error('Erreur lors de la mise à jour des utilisateurs:', error);
    process.exit(1);
  }
}

updateUsers();