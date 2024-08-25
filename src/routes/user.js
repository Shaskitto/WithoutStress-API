const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userSchema = require('../models/userModel');
const verifyToken = require('../middlewares/authJwt')
const multer = require('multer');
const { upload, gfs } = require('../db');

require('dotenv').config();
const router = express.Router();

router.get('/users/:id/profile-image', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userSchema.findById(id);

        if (!user || !user.profileImage) {
            return res.status(404).json({ message: 'User or image not found' });
        }

        const filename = user.profileImage; 

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const downloadStream = bucket.openDownloadStreamByName(filename);

        downloadStream.on('error', (err) => {
            return res.status(404).json({ message: 'File not found' });
        });
        
        res.set('Content-Type', 'image/jpeg');
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).json({ message: 'Error fetching image' });
    }
});

// Crear usuario
router.post('/users/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const lowerCaseEmail = email.toLowerCase();
        const lowerCaseUsername = username.toLowerCase();

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
        }

        const existingUser = await userSchema.findOne({
            $or: [
                { email: lowerCaseEmail },
                { username: lowerCaseUsername }
            ]
        });

        if (existingUser) {
            if (existingUser.email === lowerCaseEmail) {
                return res.status(400).json({ message: 'Este correo electrónico ya está registrado.' });
            }
            if (existingUser.username === lowerCaseUsername) {
                return res.status(400).json({ message: 'Este nombre de usuario ya está registrado.' });
            }
        }

        const user = new userSchema({ email: lowerCaseEmail, username: lowerCaseUsername, password });
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

// Obtener usuarios
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

// Obtener usuario por id
router.get('/users/:id', verifyToken, async (req, res) => {
    const { id } = req.params;  
    
    try {
        const user = await userSchema.findById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        
        const imageUrl = `${process.env.API_URL}/api/users/${id}/profile-image`;

        res.status(200).json({...user._doc, profileImage: imageUrl}); 

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario.', error: error.message });
    }
});

// Actualizar información del usuario 
router.patch('/users/:id', verifyToken, upload.single('profileImage'), async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        if (req.file) {
            const imageUrl = `${req.file.filename}`; 
            updateData.profileImage = imageUrl; 
        }

        const updatedUser = await userSchema.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario.', error: error.message });
    }
});


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
 
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET ,{ expiresIn: '1d' });
        await user.save();
 
        res.json({ token: token, userId: user._id, message: 'Inicio de sesión exitoso' });
    } catch (error) {
        res.status(500).json({ message: 'Error del servidor', error });
    }
})

module.exports = router;