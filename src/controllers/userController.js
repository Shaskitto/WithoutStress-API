const mongoose = require('mongoose');
const userSchema = require('../models/userModel');

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
        
        const imageUrl = `${process.env.API_URL}/user/${id}/profile-image`;

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

// Crear notas de un usuario
exports.updateNotes = async (req, res) => {
    const { id } = req.params;
    const { contenido, fecha } = req.body;

    try {
        const user = await userSchema.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (!contenido || !fecha) {
            return res.status(400).json({ message: 'El contenido y la fecha son obligatorios.' });
        }

        const nuevaNota = { contenido, fecha };
        user.notasPersonales.push(nuevaNota);

        await user.save();

        res.status(201).json({ message: 'Nota agregada correctamente.', nota: nuevaNota });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar la nota.', error: error.message });
    }
};

// Obtener las notas de un usuario
exports.getNotes = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userSchema.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ notas: user.notasPersonales });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las notas.', error: error.message });
    }
};

// Obtener imagen de perfil de un usuario
exports.getProfileImage = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userSchema.findById(id);

        if (!user || !user.profileImage) {
            return res.status(404).json({ message: 'Usuario o imagen no encontrado' });
        }

        const filename = user.profileImage; 

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const downloadStream = bucket.openDownloadStreamByName(filename);

        downloadStream.on('error', (err) => {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        });
        
        res.set('Content-Type', 'image/jpeg');
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la imagen' });
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