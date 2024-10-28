// const Transaction = require("../models/Transaction");
const Transaction = require("../models/transactionModel");

const User = require("../models/userModel");
const mongoose = require("mongoose");

class TransactionService {
  // Vérifier le solde d'un utilisateur
  async verifierSolde(userId, montant) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user.solde >= montant;
  }

  async getUserById(userId) {
    return await User.findById(userId);
  }

  // Mettre à jour le solde (pour débit ou crédit)
  async mettreAJourSolde(userId, montant, type) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      if (type === "debit") {
        if (user.solde < montant) {
          throw new Error("Solde insuffisant");
        }
        user.solde -= montant;
      } else if (type === "credit") {
        user.solde += montant;
      }

      await user.save({ session });
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Créer une nouvelle transaction
  async creerTransaction(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Créer la transaction
      const transaction = new Transaction({
        montant: data.montant,
        type: data.type,
        utilisateurSource: data.utilisateurSource,
        utilisateurDestination: data.utilisateurDestination,
        agent: data.agent,
        fraisTransaction: data.fraisTransaction,
        commission: data.commission,
      });

      // Si c'est un débit, vérifier le solde
      if (data.type === "debit") {
        const soldeDisponible = await this.verifierSolde(
          data.utilisateurSource,
          data.montant + data.fraisTransaction
        );
        if (!soldeDisponible) {
          throw new Error("Solde insuffisant");
        }
      }

      // Sauvegarder la transaction
      await transaction.save({ session });

      // Mettre à jour les soldes
      if (data.type === "debit") {
        await this.mettreAJourSolde(
          data.utilisateurSource,
          data.montant + data.fraisTransaction,
          "debit"
        );
      } else if (data.type === "credit") {
        await this.mettreAJourSolde(
          data.utilisateurDestination,
          data.montant,
          "credit"
        );
      }

      await session.commitTransaction();
      return transaction;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Obtenir toutes les transactions
  async obtenirToutesTransactions() {
    return await Transaction.find({})
      .populate("utilisateurSource", "nom email")
      .populate("utilisateurDestination", "nom email")
      .populate("agent", "nom")
      .sort({ creeLe: -1 });
  }

  // Obtenir l'historique des transactions d'un utilisateur
  async obtenirHistorique(userId, filtres = {}) {
    const query = {
      $or: [{ utilisateurSource: userId }, { utilisateurDestination: userId }],
    };

    // Ajouter des filtres supplémentaires
    if (filtres.dateDebut) {
      query.creeLe = { $gte: new Date(filtres.dateDebut) };
    }
    if (filtres.dateFin) {
      query.creeLe = { ...query.creeLe, $lte: new Date(filtres.dateFin) };
    }
    if (filtres.type) {
      query.type = filtres.type;
    }
    if (filtres.status) {
      query.status = filtres.status;
    }

    return await Transaction.find(query)
      .populate("utilisateurSource", "nom email")
      .populate("utilisateurDestination", "nom email")
      .populate("agent", "nom")
      .sort({ creeLe: -1 });
  }
}

module.exports = new TransactionService();
