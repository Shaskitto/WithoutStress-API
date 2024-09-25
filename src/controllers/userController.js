const userSchema = require('../models/userModel');
const mongoose = require('mongoose');

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

// Enviar solicitud de amistad
exports.sendRequest = async (req, res) => {
    const { friendId } = req.body; 
    const { id } = req.params; 

    if (!friendId || !id) {
        return res.status(400).json({ message: 'ID de usuario o amigo es requerido.' });
    }

    try {
        const existingFriendship = await userSchema.findOne({ 
            _id: id, 
            'friends.friendId': friendId 
        });

        if (existingFriendship) {
            return res.status(400).json({ message: 'Ya son amigos o ya hay una solicitud pendiente.' });
        }

        await userSchema.findByIdAndUpdate(id, {
            $addToSet: {
                friends: { friendId, status: 'pending', sentAt: Date.now() }
            }
        });

        await userSchema.findByIdAndUpdate(friendId, {
            $addToSet: {
                friends: { friendId: id, status: 'pending', sentAt: Date.now() }
            }
        });

        res.status(200).json({ 
            message: 'Solicitud de amistad enviada', 
            data: { friendId, status: 'pending' } 
        });

    } catch (error) {
        console.error('Error al enviar la solicitud de amistad:', error);
        res.status(500).json({ message: 'Error al enviar la solicitud de amistad' });
    }
};

// Aceptar solicitud de amistad
exports.acceptRequest = async (req, res) => {
    const { friendId } = req.body; 
    const { id } = req.params;

    if (!friendId || !id) {
        return res.status(400).json({ message: 'ID de usuario o amigo es requerido.' });
    }

    try {
        const user = await userSchema.findOne({ 
            _id: id, 
            'friends.friendId': friendId,
            'friends.status': 'pending'
        });

        if (!user) {
            return res.status(404).json({ message: 'No se encontró una solicitud de amistad pendiente.' });
        }

        await userSchema.updateOne(
            { _id: id, 'friends.friendId': friendId },
            { $set: { 'friends.$.status': 'accepted', 'friends.$.acceptedAt': Date.now() } }
        );

        await userSchema.updateOne(
            { _id: friendId, 'friends.friendId': id },
            { $set: { 'friends.$.status': 'accepted', 'friends.$.acceptedAt': Date.now() } }
        );

        res.status(200).json({ message: 'Solicitud de amistad aceptada' });
    } catch (error) {
        console.error('Error al aceptar la solicitud de amistad:', error);
        res.status(500).json({ message: 'Error al aceptar la solicitud de amistad' });
    }
};


// Eliminar solicitud de amistad
exports.deleteRequest = async (req, res) => {
    const { friendId } = req.body; 
    const { id } = req.params;

    if (!friendId || !id) {
        return res.status(400).json({ message: 'ID de usuario o amigo es requerido.' });
    }

    try {
        await userSchema.updateOne(
            { _id: id },
            { $pull: { friends: { friendId } } }
        );

        await userSchema.updateOne(
            { _id: friendId },
            { $pull: { friends: { friendId: id } } }
        );

        res.status(200).json({ message: 'Solicitud de amistad eliminada' });
    } catch (error) {
        console.error('Error al eliminar la solicitud de amistad:', error);
        res.status(500).json({ message: 'Error al eliminar la solicitud de amistad' });
    }
};