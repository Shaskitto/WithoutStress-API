const bcrypt = require('bcryptjs');

const hashPassword = async (req, res, next) => {
    try {
        if (!req.body.password) return next(); // Si no hay contraseña, sigue al siguiente middleware

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        next(); // Procede al siguiente middleware o ruta
    } catch (error) {
        next(error); // Maneja el error
    }
};

module.exports = hashPassword;