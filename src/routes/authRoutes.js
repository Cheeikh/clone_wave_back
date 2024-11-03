// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// Route pour initier l'inscription
router.post('/initiate-register', authController.initiateRegister);

// Route pour finaliser l'inscription
router.post('/complete-register', authController.completeRegister);

// Route pour initier la connexion
router.post('/initiate-login', authController.initiateLogin);

// Route pour finaliser la connexion
router.post('/complete-login', authController.completeLogin);

// Route pour récupérer le profil de l'utilisateur connecté
router.get('/profile', auth, authController.getProfile);

module.exports = router;
