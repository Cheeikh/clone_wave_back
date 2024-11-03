const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/authMiddleware');

// Routes protégées nécessitant une authentification
router.use(auth);

// Obtenir le profil de l'utilisateur connecté
router.get('/profile', userController.getProfile);

module.exports = router;
