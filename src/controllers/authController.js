// src/controllers/authController.js

const User = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { phoneNumber, pinCode } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }

        // Hacher le code PIN
        const hashedPinCode = await bcrypt.hash(pinCode, 10);

        // Créer un nouvel utilisateur
        const user = new User({
            phoneNumber,
            pinCode: hashedPinCode,
            // Ajoutez d'autres champs si nécessaire
        });

        await user.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, pinCode } = req.body;

        // Rechercher l'utilisateur
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier le code PIN
        const isMatch = await bcrypt.compare(pinCode, user.pinCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Code PIN invalide' });
        }

        // Générer un token JWT (si vous utilisez JWT)
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Connexion réussie' /*, token */ });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
