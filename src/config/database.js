const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Charger les variables d'environnement
        require('dotenv').config();

        // Options de connexion à la base de données
        const options = {
        };

        // Connexion à la base de données
        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('Connexion à MongoDB réussie');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB :', error);
        process.exit(1); // Arrêter le processus en cas d'erreur
    }
};

module.exports = connectDB;
