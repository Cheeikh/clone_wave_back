const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route pour le dépôt - nécessite une authentification et un rôle d'agent
router.post('/depot', 
    authMiddleware.authenticate,
    authMiddleware.requireRole('agent'),
    TransactionController.depot
);

module.exports = router;