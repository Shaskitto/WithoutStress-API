const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = require('../models/user');
const router = express.Router();


//obtener usuarios
router.get('/users', async (req, res) => {
    try {
        const users = await userSchema.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios.' });
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios.', error: error.message });
    }
})

// Crear usuario
router.post('/users/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
        }

        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Este correo electrónico ya está registrado.' });
        }

        const user = new userSchema({ username, email, password });
        const savedUser = await user.save();

        res.status(201).json({
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email, 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario.', error: error.message });
    }
})

// Iniciar sesion
router.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userSchema.findOne({ email });
        
        if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
        }
 
        const accessToken = jwt.sign({ userId: user._id, email: user.email },'secreto_del_token',{ expiresIn: '1h' });
        const refreshToken = jwt.sign({ userId: user._id, email: user.email }, 'refresh_token_secret', { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();
 
        res.json({ accessToken: accessToken, refreshToken: refreshToken, message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor', error });
    }
})

// refresh token
router.post('/users/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Token no proporcionado' });

    try {
        const decoded = jwt.verify(refreshToken, 'refresh_token_secret');
        const user = await userSchema.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Token inválido' });
        }

        const newAccessToken = jwt.sign({ userId: user._id, email: user.email }, 'access_token_secret', { expiresIn: '1h' });
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Token no válido' });
    }
});


module.exports = router;