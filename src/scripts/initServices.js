const mongoose = require('mongoose');
const Service = require('../models/service.model');
require('dotenv').config();

const services = [
  {
    type: 'transfer',
    name: 'Transfert',
    label: 'Transfert',
    icon: 'fa-exchange-alt',
    bgClass: 'bg-blue-100 dark:bg-blue-900',
    iconClass: 'text-blue-600 dark:text-blue-400',
    description: 'Transférer de l\'argent',
    isEnabled: true,
    order: 1,
    codeMarchand: null
  },
  {
    type: 'scan',
    name: 'Scanner QR',
    label: 'Scanner QR',
    icon: 'fa-qrcode',
    bgClass: 'bg-pink-100 dark:bg-pink-900',
    iconClass: 'text-pink-600 dark:text-pink-400',
    description: 'Scanner un QR code',
    isEnabled: true,
    order: 2,
    codeMarchand: null
  },
  {
    type: 'bills',
    name: 'Factures',
    label: 'Factures',
    icon: 'fa-file-invoice',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    description: 'Payer vos factures',
    isEnabled: true,
    order: 3,
    codeMarchand: null
  },
  {
    type: 'mobile',
    name: 'Recharge mobile',
    label: 'Recharge mobile',
    icon: 'fa-mobile-alt',
    bgClass: 'bg-green-100 dark:bg-green-900',
    iconClass: 'text-green-600 dark:text-green-400',
    description: 'Recharger votre mobile',
    isEnabled: true,
    order: 4,
    codeMarchand: null
  },
  {
    type: 'transport',
    name: 'Transport',
    label: 'Transport',
    icon: 'fa-bus',
    bgClass: 'bg-purple-100 dark:bg-purple-900',
    iconClass: 'text-purple-600 dark:text-purple-400',
    description: 'Acheter des tickets',
    isEnabled: true,
    order: 5,
    codeMarchand: null
  }
];

async function initServices() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Supprimer la collection services si elle existe
    if (mongoose.connection.collections['services']) {
      await mongoose.connection.collections['services'].drop();
      console.log('Collection services supprimée');
    }

    // Supprimer tous les services existants
    await Service.deleteMany({});
    console.log('Services existants supprimés');

    // Insérer les nouveaux services
    const result = await Service.insertMany(services);
    console.log(`${result.length} services ont été initialisés`);

    // Déconnexion de la base de données
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');

  } catch (error) {
    console.error('Erreur lors de l\'initialisation des services:', error);
    process.exit(1);
  }
}

// Exécuter le script
initServices();