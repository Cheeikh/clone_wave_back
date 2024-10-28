// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/transactionController");

router.get("/users/:userId/solde", TransactionController.getSolde);
router.get("/users/:userId/transactions", TransactionController.getHistorique);
router.post("/transactions/debit", TransactionController.debit);
router.post("/transactions/credit", TransactionController.credit);
// Endpoint pour obtenir toutes les transactions
router.get("/transactions", TransactionController.getAllTransactions);

module.exports = router;
