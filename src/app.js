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

// Configuration CORS avec variable d'environnement
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Appliquer CORS
app.use(cors(corsOptions));

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
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const qrRoutes = require('./routes/qrRoutes');

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/billpayments', billPaymentRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/qr', qrRoutes);

// Route de test API
app.get('/api/test', (req, res) => {
    res.json({ message: 'API fonctionne correctement' });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Gestion spécifique des erreurs de transaction
    if (err.name === 'TransactionError') {
        return res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
    
    res.status(500).json({ 
        success: false,
        error: 'Une erreur est survenue' 
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Serveur démarré sur ${HOST}:${PORT}`);
});

module.exports = app;
