const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        // Vérifier le format "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Format de token invalide' });
        }

        const token = parts[1];

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter les informations décodées à la requête
        req.user = {
            id: decoded.id,
            roles: decoded.roles,
            nom: decoded.nom,
            prenom: decoded.prenom
        };
        
        console.log('Token vérifié pour l\'utilisateur:', req.user);
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expiré' });
        }
        res.status(401).json({ message: 'Token invalide' });
    }
};
