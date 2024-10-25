import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const options = {}; // Ajoute des options si nécessaire
        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('Connexion à MongoDB réussie');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB :', error);
        process.exit(1); // Arrêter le processus en cas d'erreur
    }
};

export default connectDB;
