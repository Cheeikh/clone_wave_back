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
        console.log('Corps de la requête reçue:', req.body);
        
        let phoneNumber = req.body.phoneNumber;
        
        if (!phoneNumber) {
            return res.status(400).json({ 
                message: 'Le numéro de téléphone est requis',
                receivedData: req.body
            });
        }

        // S'assurer que le numéro commence par "+"
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }
        
        // Nettoyer le numéro de téléphone en gardant le "+"
        const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
        
        console.log('Numéro de téléphone nettoyé:', cleanPhoneNumber);

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ telephone: cleanPhoneNumber });
        if (existingUser) {
            console.log('Utilisateur existant trouvé:', existingUser.telephone);
            return res.status(400).json({ 
                message: 'Un compte existe déjà avec ce numéro' 
            });
        }

        // Créer un utilisateur temporaire avec uniquement le téléphone
        const tempUser = new User({
            telephone: cleanPhoneNumber,
            isTelephoneVerifie: false,
            roles: ['utilisateur']
        });

        console.log('Tentative de création d\'utilisateur:', tempUser);

        await tempUser.save();
        console.log('Utilisateur créé avec succès');

        // Générer et sauvegarder l'OTP
        const otpCode = generateOTP();
        const otp = new OTP({
            utilisateur: tempUser._id,
            code: otpCode
        });

        await otp.save();
        console.log('OTP généré et sauvegardé');

        // Envoyer l'OTP par SMS
        const smsBody = `Votre code de vérification pour l'inscription est : ${otpCode}`;
        await sendSMS(cleanPhoneNumber, smsBody);
        console.log('SMS envoyé avec succès');

        res.status(200).json({ 
            message: 'Code de vérification envoyé', 
            userId: tempUser._id 
        });
    } catch (error) {
        console.error('Erreur détaillée lors de l\'initiation de l\'inscription :', error);
        res.status(500).json({ 
            message: 'Erreur lors de l\'inscription',
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : null
        });
    }
};

exports.completeRegister = async (req, res) => {
    try {
        const { userId, otpCode, pinCode, firstName, lastName } = req.body;

        if (!userId || !otpCode || !pinCode || !firstName || !lastName) {
            return res.status(400).json({ 
                message: 'Tous les champs sont requis' 
            });
        }

        // Vérifier l'OTP
        const otp = await OTP.findOne({ utilisateur: userId, code: otpCode });
        if (!otp) {
            return res.status(400).json({ 
                message: 'Code de vérification invalide ou expiré' 
            });
        }

        // Récupérer l'utilisateur
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ 
                message: 'Utilisateur non trouvé' 
            });
        }

        // Hacher le code PIN
        const hashedPinCode = await bcrypt.hash(pinCode, 10);

        // Mettre à jour l'utilisateur avec toutes les informations
        user.pinCode = hashedPinCode;
        user.nom = lastName;
        user.prenom = firstName;
        user.isTelephoneVerifie = true;

        await user.save();

        // Supprimer l'OTP
        await OTP.deleteOne({ _id: otp._id });

        // Générer un token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                roles: user.roles,
                nom: user.nom,
                prenom: user.prenom 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: 'Inscription réussie', 
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                telephone: user.telephone,
                roles: user.roles
            }
        });
    } catch (error) {
        console.error('Erreur lors de la finalisation de l\'inscription :', error);
        res.status(500).json({ 
            message: 'Erreur serveur',
            error: error.message 
        });
    }
};

exports.initiateLogin = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Rechercher l'utilisateur
        const user = await User.findOne({ telephone: phoneNumber });
        if (!user) {
            return res.status(401).json({ message: 'Aucun compte trouvé avec ce numéro' });
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
        await sendSMS(phoneNumber, smsBody);

        res.status(200).json({ 
            message: 'Code de vérification envoyé',
            userId: user._id 
        });
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
        const token = jwt.sign(
            { 
                id: user._id,
                roles: user.roles,
                nom: user.nom,
                prenom: user.prenom
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Ajouter le token à la liste des tokens de l'utilisateur
        user.tokens = user.tokens || [];
        user.tokens.push(token);
        await user.save();

        // Retourner la réponse avec le token et les informations de l'utilisateur
        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                telephone: user.telephone,
                solde: user.solde,
                roles: user.roles,
                isTelephoneVerifie: user.isTelephoneVerifie
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-pinCode -tokens');
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({
            id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            solde: user.solde,
            roles: user.roles,
            isTelephoneVerifie: user.isTelephoneVerifie
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
