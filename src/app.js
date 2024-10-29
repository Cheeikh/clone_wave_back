// src/app.js

const express = require('express');
const connectDB = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');

// Charger les variables d'environnement
require('dotenv').config();

// Initialiser Express
const app = express();
app.use(cors());

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
const billPaymentRoutes = require('./routes/billPaymentRoutes');
const creditRoutes = require('./routes/creditRoutes');
const transactionRoutes = require('./routes/transactionRoutes'); // Nouvelle importation

// Vérifier le type des routes
console.log('authRoutes:', authRoutes);
console.log('billPaymentRoutes:', billPaymentRoutes);
console.log('transactionRoutes:', transactionRoutes); // Ajout du log pour vérification

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/billpayments', billPaymentRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/transactions', transactionRoutes); // Nouvelle route pour les transactions

// Route de test API
app.get('/api/test', (req, res) => {
    res.json({ message: 'API fonctionne correctement' });
});

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