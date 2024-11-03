const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/authMiddleware');

// Routes protégées nécessitant une authentification
router.use(auth);

// Créer une nouvelle transaction
router.post('/transfer', transactionController.createTransfer);

// Obtenir l'historique des transactions
router.get('/history', transactionController.getTransactionHistory);

// Obtenir les détails d'une transaction
router.get('/:id', transactionController.getTransactionDetails);

module.exports = router;
