// src/controllers/authController.js

require('dotenv').config();

const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Infobip, AuthType } = require('@infobip-api/sdk');

// Configuration d'Infobip
const infobipClient = new Infobip({
    baseUrl: process.env.INFOBIP_BASE_URL,
    apiKey: process.env.INFOBIP_API_KEY,
    authType: AuthType.ApiKey,
});

// Fonction pour générer un OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Fonction pour envoyer un SMS avec Infobip
const sendSMS = async (to, body) => {
    try {
        const smsResponse = await infobipClient.channels.sms.send({
            messages: [
                {
                    destinations: [{ to: to }],
                    text: body,
                    from: process.env.INFOBIP_SENDER
                }
            ]
        });
        console.log('SMS envoyé avec succès');
        return smsResponse;
    } catch (error) {
        console.error('Erreur lors de l\'envoi du SMS:', error);
        throw new Error('Erreur lors de l\'envoi du SMS');
    }
};

// Vérification de JWT_SECRET
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET n\'est pas défini dans les variables d\'environnement');
}

exports.initiateRegister = async (req, res) => {
    try {

        const { telephone, nom, prenom, role } = req.body;

        // Vérifier si le rôle est valide
        const validRoles = ['utilisateur', 'agent', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Rôle invalide' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ telephone });
        if (existingUser) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }

        // Créer un utilisateur temporaire
        const tempUser = new User({
            telephone,
            nom,
            prenom,
            roles: [role],
            isTelephoneVerifie: false
        });

        await tempUser.save();

        // Générer et sauvegarder l'OTP
        const otpCode = generateOTP();
        const otp = new OTP({
            utilisateur: tempUser._id,
            code: otpCode
        });

        await otp.save();

        // Envoyer l'OTP par SMS
        const smsBody = `Votre code de vérification pour l'inscription est : ${otpCode}`;
        await sendSMS(telephone, smsBody);

        res.status(200).json({ message: 'OTP envoyé par SMS', userId: tempUser._id });
    } catch (error) {
        console.error('Erreur lors de l\'initiation de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.completeRegister = async (req, res) => {
    try {
        const { userId, otpCode, pinCode } = req.body;

        // Vérifier l'OTP
        const otp = await OTP.findOne({ utilisateur: userId, code: otpCode });
        if (!otp) {
            return res.status(400).json({ message: 'OTP invalide ou expiré' });
        }

        // Récupérer l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        // Hacher le code PIN
        const hashedPinCode = await bcrypt.hash(pinCode, 10);


        // Mettre à jour l'utilisateur
        user.pinCode = hashedPinCode;
        user.isTelephoneVerifie = true;
        await user.save();

        // Supprimer l'OTP
        await OTP.deleteOne({ _id: otp._id });

        // Générer un token JWT
        const token = jwt.sign(
            { id: user._id, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ message: 'Inscription réussie', token });
    } catch (error) {
        console.error('Erreur lors de la finalisation de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

exports.initiateLogin = async (req, res) => {
    try {
        const { telephone } = req.body;

        // Rechercher l'utilisateur
        const user = await User.findOne({ telephone });
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Générer et sauvegarder l'OTP
        const otpCode = generateOTP();
        const otp = new OTP({
            utilisateur: user._id,
            code: otpCode
        });

        await otp.save();

        // Envoyer l'OTP par SMS
        const smsBody = `Votre code de vérification pour la connexion est : ${otpCode}`;
        await sendSMS(telephone, smsBody);

        res.status(200).json({ message: 'OTP envoyé par SMS', userId: user._id });
    } catch (error) {
        console.error('Erreur lors de l\'initiation de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


exports.completeLogin = async (req, res) => {
    try {
        const { userId, pinCode, otpCode } = req.body;

        // Vérifier l'OTP
        const otp = await OTP.findOne({ utilisateur: userId, code: otpCode });
        if (!otp) {
            return res.status(401).json({ message: 'OTP invalide ou expiré' });
        }

        // Rechercher l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier le code PIN
        const isMatch = await bcrypt.compare(pinCode, user.pinCode);
        if (!isMatch) {
            return res.status(401).json({ message: 'Code PIN invalide' });
        }

        // Supprimer l'OTP
        await OTP.deleteOne({ _id: otp._id });

        // Générer un token JWT
        const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Ajouter le token à la liste des tokens de l'utilisateur
        user.tokens.push(token);
        await user.save();

        res.status(200).json({ message: 'Connexion réussie', token });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
