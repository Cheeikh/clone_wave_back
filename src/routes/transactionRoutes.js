// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const AgentController = require('../controllers/agentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes de transaction
router.post('/depot', 
    authMiddleware.authenticateUser,
    authMiddleware.authorizeRoles('agent'),
    TransactionController.depot
);

router.post('/retrait',
    authMiddleware.authenticateUser,
    authMiddleware.authorizeRoles('agent'),
    TransactionController.retrait
);

// Route pour le webhook
router.post('/webhook',
    TransactionController.handleWebhook
);

// Route pour vérifier le statut d'une transaction
router.get('/:id/status',
    authMiddleware.authenticateUser,
    TransactionController.getTransactionStatus
);

// Routes pour la gestion des commissions
router.get('/agent/:id/commissions',
    authMiddleware.authenticateUser,
    authMiddleware.authorizeRoles('agent'),
    AgentController.getCommissions
);

router.post('/agent/commission/retrait',
    authMiddleware.authenticateUser,
    authMiddleware.authorizeRoles('agent'),
    AgentController.retraitCommission
);

module.exports = router;