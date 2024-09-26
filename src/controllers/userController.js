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
        const existingRequest = await userSchema.findOne({
            _id: friendId, 
            "friends.friendId": id 
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'Ya has enviado una solicitud a este amigo.' });
        }

        await userSchema.findByIdAndUpdate(id, {
            $addToSet: {
                friends: { friendId, status: 'sent', sentAt: Date.now() }
            }
        }, { new: true });

        await userSchema.findByIdAndUpdate(friendId, {
            $addToSet: {
                friends: { friendId: id, status: 'pending', sentAt: Date.now() }
            }
        }, { new: true });

        res.status(200).json({ message: 'Solicitud de amistad enviada correctamente.'});

    } catch (error) {
        res.status(500).json({ message: 'Error al enviar la solicitud de amistad' });
    }
};

// Obtener solicitudes pendientes
exports.getPendingRequests = async (req, res) => {
    const { id } = req.params;  

    try {
        const user = await userSchema.findById(id).populate('friends.friendId', 'username informacion profileImage');

        const pendingRequests = user.friends.filter(friend => friend.status === 'pending');

        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
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
        const updatedUser = await userSchema.findOneAndUpdate(
            { _id: id, "friends.friendId": friendId },
            { 
                $set: { 
                    "friends.$.status": "accepted", 
                    "friends.$.acceptedAt": Date.now() 
                } 
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'No se encontró la solicitud de amistad.' });
        }

        await userSchema.findByIdAndUpdate(
            friendId,
            {
                $addToSet: {
                    friends: { friendId: id, status: 'accepted', acceptedAt: Date.now() }
                }
            },
            { new: true }
        );

        res.status(200).json({ message: 'Solicitud de amistad aceptada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al aceptar la solicitud de amistad.' });
    }
};

// Rechazar solicitud de amistad
exports.declineRequest = async (req, res) => {
    const { friendId } = req.body; 
    const { id } = req.params; 

    if (!friendId || !id) {
        return res.status(400).json({ message: 'ID de usuario o amigo es requerido.' });
    }

    try {
        const updatedUser = await userSchema.findOneAndUpdate(
            { _id: id, "friends.friendId": friendId },
            { 
                $pull: { friends: { friendId } } 
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'No se encontró la solicitud de amistad.' });
        }

        await userSchema.findByIdAndUpdate(
            friendId,
            {
                $pull: { friends: { friendId: id } } 
            },
            { new: true }
        );

        res.status(200).json({ message: 'Solicitud de amistad rechazada correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al rechazar la solicitud de amistad.' });
    }
};

// Obtener amigos
exports.getFriends = async (req, res) => {
    const { id } = req.params; 

    if (!id) {
        return res.status(400).json({ message: 'ID de usuario es requerido.' });
    }

    try {
        const user = await userSchema.findById(id).populate('friends.friendId', 'username informacion profileImage');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const acceptedFriends = user.friends.filter(friend => friend.status === 'accepted');

        res.status(200).json(acceptedFriends);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener amigos.' });
    }
};

// Buscar amigos por nombre de usuario
exports.searchFriend = async (req, res) => {
    const { username } = req.params;

    try {
        const users = await userSchema.find({
            username: { $regex: username, $options: 'i' }
        }).select('username informacion profileImage'); 

        if (users.length === 0) {
            return res.status(404).json({ message: 'No se encontraron amigos con ese nombre de usuario.' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error al buscar amigos:', error);
        res.status(500).json({ message: 'Error al buscar amigos.' });
    }
};