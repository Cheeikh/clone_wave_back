// src/app.js


const express = require("express");
const connectDB = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const cors = require("cors");



// Charger les variables d'environnement
require("dotenv").config();

// Initialiser Express
const app = express();
app.use(cors());

// Connecter à la base de données
connectDB();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Configurer les fichiers statiques
app.use(express.static(path.join(__dirname, '..', 'public')));

// Charger le fichier swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, "docs", "swagger.yaml"));

// Configurer Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const authRoutes = require("./routes/authRoutes");
const billPaymentRoutes = require("./routes/billPaymentRoutes");
const creditRoutes = require("./routes/creditRoutes");
const transactionRoutes = require("./routes/transactionRoutes"); // Importer les routes de transactions
const serviceRoutes = require('./routes/serviceRoutes');
const paiementRoutes = require('./routes/paiementRoutes');



// Vérifier le type de authRoutes
console.log("authRoutes:", authRoutes); // Doit afficher un objet Router
console.log("billPaymentRoutes:", billPaymentRoutes);

// Utiliser les routes
app.use("/api/auth", authRoutes);
app.use("/api/billpayments", billPaymentRoutes); // Ajout des routes de paiement
app.use("/api/credit", creditRoutes); // Utiliser les routes pour achatCredit
app.use("/api", transactionRoutes); // Ajouter les routes pour transactions
app.use('/api/services', serviceRoutes);
app.use('/api/paiements', paiementRoutes);

// Route de test API
app.get("/api/test", (req, res) => {
  res.json({ message: "API fonctionne correctement" });
});

// Middleware de gestion des erreurs (facultatif mais recommandé)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Une erreur est survenue" });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {

  console.log(`Serveur démarré sur le port ${PORT}`);
});
