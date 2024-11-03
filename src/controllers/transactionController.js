const transactionService = require('../services/transactionService');
const { validateTransfer } = require('../middlewares/validationMiddleware');

exports.createTransfer = async (req, res, next) => {
    try {
        const { phoneNumber, amount, description, pin } = req.body;
        const sourceUserId = req.user.id;

        console.log('Controller - Données extraites:', { 
            phoneNumber, 
            amount, 
            description, 
            sourceUserId 
        });

        // Valider les données de la transaction
        const validationError = validateTransfer(req.body);
        if (validationError) {
            return res.status(400).json({ 
                success: false,
                error: validationError 
            });
        }

        // Vérifier que le PIN est fourni
        if (!pin) {
            return res.status(400).json({
                success: false,
                error: 'Le code PIN est requis'
            });
        }

        const parsedAmount = parseFloat(amount);
        const transaction = await transactionService.createTransfer({
            sourceUserId,
            phoneNumber,
            amount: parsedAmount,
            description: description || 'Transfert',
            pin
        });

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Controller - Erreur complète:', error);
        if (error.name === 'TransactionError') {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        next(error);
    }
};

exports.getTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const transactions = await transactionService.getUserTransactions(userId);
        
        res.json({
            success: true,
            data: transactions
        });
    } catch (error) {
        next(error);
    }
};

exports.getTransactionDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const transaction = await transactionService.getTransactionById(id, userId);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction non trouvée'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};
