import express from 'express';
import connectDB from './config/database.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import transactionRoutes from './routes/transactionRoutes.js';
import dotenv from 'dotenv';
import parameterRoutes from "./services/parameterRoutes.js";

// Charger les variables d'environnement
dotenv.config();

// Initialiser Express
const app = express();

// Connecter à la base de données
connectDB();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Transaction Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/parameters', parameterRoutes);

// Configurer Swagger UI (si nécessaire, décommenter)
// const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
