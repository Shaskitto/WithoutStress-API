const jwt = require('jsonwebtoken');
const userSchema = require('../models/userModel');

const verifyToken = async (req, res, next) => {
    const token = req.headers["x-access-token"];

    if(!token){
        return res.status(403).json({ message: 'No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.userId = decoded.userId; 

        const user = await userSchema.findById(req.userId, { password: 0 });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'No autorizado', error });
    }
}

module.exports = verifyToken;