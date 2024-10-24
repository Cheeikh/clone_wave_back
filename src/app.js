// src/app.js

const express = require('express');
const connectDB = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config();

// Initialiser Express
const app = express();

// Connecter à la base de données
connectDB();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Charger le fichier swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// Configurer Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Importer les routes
const authRoutes = require('./routes/authRoutes');
// Importez d'autres routes ici si nécessaire

// Vérifier le type de authRoutes
console.log('authRoutes:', authRoutes); // Doit afficher un objet Router

// Utiliser les routes
app.use('/api/auth', authRoutes);

// Middleware de gestion des erreurs (facultatif mais recommandé)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Une erreur est survenue' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
