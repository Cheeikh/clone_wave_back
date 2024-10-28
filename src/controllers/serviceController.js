const mongoose = require('mongoose');
const Service = require('../models/serviceModel');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Fonction pour s'assurer que les dossiers existent
const ensureDirectoriesExist = () => {
    // Chemin vers le dossier public
    const publicDir = path.join(__dirname, '..', '..', 'public');
    const qrCodeDir = path.join(publicDir, 'qrcodes');

    // Créer les dossiers s'ils n'existent pas
    try {
        if (!fs.existsSync(publicDir)) {
            console.log('Création du dossier public...');
            fs.mkdirSync(publicDir);
            console.log('Dossier public créé avec succès');
        }

        if (!fs.existsSync(qrCodeDir)) {
            console.log('Création du dossier qrcodes...');
            fs.mkdirSync(qrCodeDir);
            console.log('Dossier qrcodes créé avec succès');
        }

        // Vérifier les permissions
        fs.chmodSync(publicDir, '755');
        fs.chmodSync(qrCodeDir, '755');

        return qrCodeDir;
    } catch (error) {
        console.error('Erreur lors de la création des dossiers:', error);
        throw error;
    }
};

// S'assurer que les dossiers existent au démarrage
const qrCodeDir = ensureDirectoriesExist();

const generateUniqueMerchantCode = async () => {
    const prefix = 'MERCH';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const code = `${prefix}${randomNum}`;
    
    const existingService = await Service.findOne({ codeMarchand: code });
    if (existingService) {
        return generateUniqueMerchantCode();
    }
    return code;
};

exports.createService = async (req, res) => {
    try {
        // S'assurer que les dossiers existent à chaque requête
        ensureDirectoriesExist();

        const { nom, description, prix } = req.body;

        // Générer un code marchand unique
        const codeMarchand = await generateUniqueMerchantCode();
        console.log('Code marchand généré:', codeMarchand);

        // Créer un nouvel objet Service
        const service = new Service({
            nom,
            description,
            prix,
            codeMarchand
        });

        // Sauvegarder d'abord le service
        await service.save();
        console.log('Service sauvegardé avec ID:', service._id);

        // Générer le nom et le chemin du fichier QR code
        const qrFileName = `qrcode-${service._id}.png`;
        const qrFilePath = path.join(qrCodeDir, qrFileName);
        console.log('Chemin du fichier QR code:', qrFilePath);

        // Contenu du QR code
        const qrData = JSON.stringify({
            serviceId: service._id,
            codeMarchand: service.codeMarchand,
            nom: service.nom
        });

        // Générer et sauvegarder le QR code
        await QRCode.toFile(qrFilePath, qrData);
        console.log('QR code généré avec succès à:', qrFilePath);

        // Mettre à jour le chemin du QR code dans le service
        const qrCodeRelativePath = `/qrcodes/${qrFileName}`;
        service.qrCode = qrCodeRelativePath;
        await service.save();
        console.log('Service mis à jour avec le chemin QR code');

        res.status(201).json({ 
            message: 'Service créé avec succès', 
            service: {
                ...service.toJSON(),
                qrCodeUrl: `${req.protocol}://${req.get('host')}${qrCodeRelativePath}`
            }
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        if (error.code === 11000) {
            res.status(400).json({ 
                message: 'Le code marchand existe déjà, veuillez réessayer'
            });
        } else {
            res.status(500).json({ 
                message: 'Erreur serveur',
                error: error.message,
                stack: error.stack
            });
        }
    }
};