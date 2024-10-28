// const TransactionService = require("../services/TransactionService");
const TransactionService = require("/home/souleye/clone_wave_back/src/services/transactionService.js");

class TransactionController {
  // Endpoint: Obtenir le solde d'un utilisateur
  async getSolde(req, res) {
    try {
      const { userId } = req.params;
      const user = await TransactionService.getUserById(userId); // assurez-vous que TransactionService a cette méthode
      if (!user)
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      res.json({ solde: user.solde });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Endpoint: Obtenir l'historique des transactions d'un utilisateur
  async getHistorique(req, res) {
    try {
      const { userId } = req.params;
      const filtres = req.query;
      const transactions = await TransactionService.obtenirHistorique(
        userId,
        filtres
      );
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Endpoint: Obtenir toutes les transactions
  async getAllTransactions(req, res) {
    try {
      const transactions = await TransactionService.obtenirToutesTransactions(); // Assurez-vous d'avoir cette méthode dans le service
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Endpoint: Effectuer un débit
  async debit(req, res) {
    try {
      const { userId } = req.body;
      const { montant } = req.body;
      const transactionData = {
        montant,
        type: "debit",
        utilisateurSource: userId,
      };
      const transaction = await TransactionService.creerTransaction(
        transactionData
      );
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Endpoint: Effectuer un crédit
  async credit(req, res) {
    try {
      const { userId, montant } = req.body;
      const transactionData = {
        montant,
        type: "credit",
        utilisateurDestination: userId,
      };
      const transaction = await TransactionService.creerTransaction(
        transactionData
      );
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new TransactionController();
