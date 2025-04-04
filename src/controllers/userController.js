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
exports.createNotes = async (req, res) => {
    const { id } = req.params;
    const { titulo, fecha, horaInicio, horaFin, allDay } = req.body;

    try {
        const user = await userSchema.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (!titulo || !fecha || (!allDay && !horaInicio)) {
            return res.status(400).json({ message: 'El título, fecha y horaInicio (si no es allDay) son obligatorios.' });
        }

        const nuevaNota = { 
            titulo, 
            fecha, 
            horaInicio: allDay ? undefined : horaInicio, 
            horaFin: allDay ? undefined : horaFin, 
            allDay: allDay || false 
        };

        user.notasPersonales.push(nuevaNota);
        await user.save();

        res.status(201).json({ message: 'Nota agregada correctamente.', nota: nuevaNota });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar la nota.', error: error.message });
    }
};

// Actualizar una nota de un usuario
exports.updateNotes = async (req, res) => {
    try {
        const { id, noteId } = req.params;
        const { titulo, fecha, horaInicio, horaFin, allDay } = req.body;

        const user = await userSchema.findById(id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const note = user.notasPersonales.id(noteId);
        if (!note) return res.status(404).json({ message: "Nota no encontrada" });

        if (titulo) note.titulo = titulo;
        if (fecha) note.fecha = fecha;
        if (allDay !== undefined) note.allDay = allDay;
        if (!allDay && horaInicio) note.horaInicio = horaInicio;
        if (!allDay && horaFin !== undefined) note.horaFin = horaFin;
        if (allDay) {
            note.horaInicio = null;
            note.horaFin = null;
        }

        await user.save();
        res.status(200).json({ message: "Nota actualizada correctamente", nota: note });

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la nota", error: error.message });
    }
};
  
// Eliminar una nota de un usuario
exports.deleteNotes = async (req, res) => {
    try {
        const { id, noteId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ message: "ID de usuario o nota inválido" });
        }

        const user = await userSchema.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const initialLength = user.notasPersonales.length;
        user.notasPersonales = user.notasPersonales.filter(note => note._id.toString() !== noteId);

        if (user.notasPersonales.length === initialLength) {
            return res.status(404).json({ message: "Nota no encontrada" });
        }

        await user.save();
        res.status(200).json({ message: "Nota eliminada correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la nota", error: error.message });
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

// Registro estado de ánimo de un usuario
exports.registerMood = async (req, res)  => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const validMoods = ['Muy bien', 'Bien', 'Neutro', 'Mal', 'Muy mal'];
        if (!validMoods.includes(estado)) {
            return res.status(400).json({ error: 'Estado de ánimo inválido' });
        }

        const user = await userSchema.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Obtener la fecha actual en formato UTC sin horas, minutos ni segundos
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Verificar si ya registró su estado de ánimo hoy
        const alreadyRegistered = user.estadoDeAnimo.some(entry => {
            const entryDate = new Date(entry.fecha);
            entryDate.setUTCHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });

        if (alreadyRegistered) {
            return res.status(400).json({ error: 'Ya registraste tu estado de ánimo hoy.' });
        }

        // Registrar el nuevo estado de ánimo
        user.estadoDeAnimo.push({ fecha: new Date(), estado });
        await user.save();

        res.status(200).json({ message: 'Estado de ánimo registrado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar estado de ánimo' });
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