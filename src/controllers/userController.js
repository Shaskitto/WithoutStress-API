const userSchema = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Crear usuario
exports.registerUser = async (req, res) => {
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
};

// Iniciar sesion
exports.loginUser = async (req, res) => {
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
};

// Obtener usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userSchema.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios.' });
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios.', error: error.message });
    }
};

// Obtener usuario por id
exports.getUserById = async (req, res) => {
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
};

// Actualizar información del usuario 
exports.updateUserById = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        if (updateData.username) {
            const lowerCaseUsername = updateData.username.toLowerCase();
            const usernameExists = await userSchema.findOne({ username: lowerCaseUsername });
            if (usernameExists && usernameExists._id.toString() !== id) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
            }
            updateData.username = lowerCaseUsername;
        }

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
};

// Obtener imagen de perfil de un usuario
exports.getProfileImage = async (req, res) => {
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
};

// cargar imagen por defecto al usuario
exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen.' });
    }

    res.status(200).json({
        message: 'Imagen cargada con éxito.',
    });
};