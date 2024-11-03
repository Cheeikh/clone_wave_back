const Transaction = require('../models/transaction');
const User = require('../models/user');

const QRController = {
  validateQRCode: async (req, res) => {
    try {
      const { userId, timestamp, expiresIn } = req.body;

      // Vérifier si le QR code n'est pas expiré
      const currentTime = Date.now();
      const expirationTime = timestamp + (expiresIn * 1000); // convertir en millisecondes
      
      if (currentTime > expirationTime) {
        return res.status(400).json({
          success: false,
          message: 'QR code expiré'
        });
      }

      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'QR code valide'
      });
    } catch (error) {
      console.error('Erreur lors de la validation du QR code:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la validation du QR code'
      });
    }
  },

  processQRTransfer: async (req, res) => {
    try {
      const { sourceUserId, amount, description, pin } = req.body;
      const destinationUserId = req.user.id; // L'utilisateur authentifié qui scanne le QR

      // Vérifier si les utilisateurs existent
      const sourceUser = await User.findById(sourceUserId);
      const destinationUser = await User.findById(destinationUserId);

      if (!sourceUser || !destinationUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier le PIN
      if (!await sourceUser.comparePin(pin)) {
        return res.status(400).json({
          success: false,
          message: 'Code PIN incorrect'
        });
      }

      // Vérifier le solde
      if (sourceUser.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Solde insuffisant'
        });
      }

      // Créer la transaction
      const transaction = new Transaction({
        type: 'transfer',
        amount: amount,
        description: description,
        sourceUser: sourceUserId,
        destinationUser: destinationUserId,
        status: 'completed'
      });

      // Mettre à jour les soldes
      sourceUser.balance -= amount;
      destinationUser.balance += amount;

      // Sauvegarder les changements
      await Promise.all([
        transaction.save(),
        sourceUser.save(),
        destinationUser.save()
      ]);

      res.json({
        success: true,
        message: 'Transfert effectué avec succès',
        transaction: transaction
      });
    } catch (error) {
      console.error('Erreur lors du transfert QR:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du transfert'
      });
    }
  }
};

module.exports = QRController; 