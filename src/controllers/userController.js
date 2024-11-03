const User = require('../models/userModel');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-pinCode -tokens');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        res.json({
            success: true,
            data: {
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
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur',
            error: error.message 
        });
    }
};
