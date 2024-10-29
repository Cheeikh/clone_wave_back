module.exports = (requiredRoles) => {
    return (req, res, next) => {
      const user = req.user; // Ce user doit être mis à disposition après l'authentification
      if (!requiredRoles.includes(user.roles)) {
        return res.status(403).json({ message: 'Accès refusé: Rôle insuffisant' });
      }
      next();
    };
  };
  