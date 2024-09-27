const userSchema = require('../models/userModel');
const mongoose = require('mongoose');

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
        
        await userSchema.findOneAndUpdate(
            { _id: friendId, "friends.friendId": id },
            { 
                $set: { 
                    "friends.$.status": "accepted", 
                    "friends.$.acceptedAt": Date.now() 
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
        res.status(500).json({ message: 'Error al buscar amigos.' });
    }
};

exports.deleteFriend = async (req, res) => {
    const { friendId } = req.params;  
    const { id } = req.user;  

    if (!friendId || !id) {
        return res.status(400).json({ message: 'ID de usuario o amigo es requerido.' });
    }

    try {
        const updatedUser = await userSchema.findOneAndUpdate(
            { _id: id },
            { $pull: { friends: { friendId } } },  
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'No se encontró la amistad para eliminar.' });
        }

        const updatedFriend = await userSchema.findOneAndUpdate(
            { _id: friendId },
            { $pull: { friends: { friendId: id } } },  
            { new: true }
        );

        res.status(200).json({ message: 'Amigo eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el amigo.' });
    }
};
