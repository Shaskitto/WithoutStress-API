const userSchema = require('../models/userModel');

// Generar el plan
exports.generarPlan = async (req, res) => {
    try {
        const { estadoDeAnimo } = req.body;

        const user = await userSchema.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Obtener el estado actual (desde el body o el último guardado en el usuario)
        let estado;

        if (estadoDeAnimo) {
            // Si se envía un nuevo estado, lo usamos
            estado = estadoDeAnimo;
            // También lo agregamos al historial del usuario
            user.estadoDeAnimo.push({
                estado,
                fecha: new Date()
            });
        } else if (user.estadoDeAnimo.length > 0) {
            // Si no se envía, usamos el último guardado
            estado = user.estadoDeAnimo[user.estadoDeAnimo.length - 1].estado;
        } else {
            return res.status(400).json({ message: 'No se proporcionó un estado de ánimo y el usuario no tiene uno registrado anteriormente.' });
        }

        // Validamos si el estado es uno de los aceptados
        const categoriasPorEstado = {
            'Muy bien': {
                Manana: ['Aprender', 'Ejercicios de Respiración'],
                Tarde: ['Meditación y Mindfulness', 'Podcast'],
                Noche: ['Música y Sonidos Relajantes', 'Meditación y Mindfulness'],
            },
            Bien: {
                Manana: ['Aprender', 'Podcast'],
                Tarde: ['Meditación y Mindfulness', 'Meditación'],
                Noche: ['Música y Sonidos Relajantes', 'Ejercicios de Respiración'],
            },
            Neutro: {
                Manana: ['Ejercicios de Respiración', 'Aprender'],
                Tarde: ['Podcast', 'Mindfulness'],
                Noche: ['Música y Sonidos Relajantes', 'Meditación y Mindfulness'],
            },
            Mal: {
                Manana: ['Ejercicios de Respiración', 'Meditación y Mindfulness'],
                Tarde: ['Podcast', 'Mindfulness'],
                Noche: ['Música y Sonidos Relajantes', 'Meditación y Mindfulness'],
            },
            'Muy mal': {
                Manana: ['Ejercicios de Respiración', 'Meditación y Mindfulness'],
                Tarde: ['Podcast', 'Mindfulness'],
                Noche: ['Música y Sonidos Relajantes', 'Meditación y Mindfulness'],
            },
        };

        if (!categoriasPorEstado[estado]) {
            return res.status(400).json({ message: 'Estado de ánimo no válido' });
        }

        const planGenerado = {
            data: categoriasPorEstado[estado],
            horario: {
                Manana: categoriasPorEstado[estado].Manana,
                Tarde: categoriasPorEstado[estado].Tarde,
                Noche: categoriasPorEstado[estado].Noche,
            },
            estadoDeAnimo: estado,
        };

        user.planDiario = planGenerado;

        await user.save();

        res.status(200).json({
            message: 'Estado de ánimo actualizado y plan generado exitosamente',
            planDiario: user.planDiario,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el estado de ánimo y generar el plan', error });
    }
};

// Obtener el plan de un usuario
exports.obtenerPlan = async (req, res) => {
    const { id } = req.params;  

    try {
        const user = await userSchema.findById(id);  

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ planDiario: user.planDiario });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el plan', error });
    }
};
