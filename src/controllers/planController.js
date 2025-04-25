const userSchema = require('../models/userModel');
const resourceSchema = require('../models/resourceModel');

// Generar el plan
exports.generarPlan = async (req, res) => {
    try {
        const { estadoDeAnimo } = req.body;
        const user = await userSchema.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        let estado;
        if (estadoDeAnimo) {
            estado = estadoDeAnimo;
        } else if (user.estadoDeAnimo.length > 0) {
            estado = user.estadoDeAnimo[user.estadoDeAnimo.length - 1].estado;
        } else {
            return res.status(400).json({ message: 'No se proporcionó un estado de ánimo y el usuario no tiene uno registrado anteriormente.' });
        }

        const categoriasPorEstado = {
            'Muy bien': {
                Manana: ['Podcast', 'Aprender'],
                Tarde: ['Ejercicios de Respiración', 'Música y Sonidos Relajantes'],
                Noche: ['Meditación y Mindfulness'],
            },
            Bien: {
                Manana: ['Meditación y Mindfulness', 'Ejercicios de Respiración'],
                Tarde: ['Aprender', 'Podcast'],
                Noche: ['Meditación y Mindfulness', 'Música y Sonidos Relajantes'],
            },
            Neutro: {
                Manana: ['Podcast', 'Meditación y Mindfulness'],
                Tarde: ['Ejercicios de Respiración', 'Aprender'],
                Noche: ['Meditación y Mindfulness', 'Música y Sonidos Relajantes'],
            },
            Mal: {
                Manana: ['Meditación y Mindfulness', 'Ejercicios de Respiración'],
                Tarde: ['Música y Sonidos Relajantes', 'Podcast'],
                Noche: ['Meditación y Mindfulness'],
            },
            'Muy mal': {
                Manana: ['Meditación y Mindfulness'],
                Tarde: ['Ejercicios de Respiración', 'Podcast'],
                Noche: ['Música y Sonidos Relajantes', 'Aprender'],
            },
        };        

        if (!categoriasPorEstado[estado]) {
            return res.status(400).json({ message: 'Estado de ánimo no válido' });
        }

        const categorias = categoriasPorEstado[estado];
        const horarioUsuario = user.horario;
        const planFinal = { Manana: [], Tarde: [], Noche: [] };
        const recursosSeleccionados = new Set(); 

        for (const franja of ['Manana', 'Tarde', 'Noche']) {
            if (horarioUsuario[franja.toLowerCase()] && horarioUsuario[franja.toLowerCase()].length > 0) {
                const categoriasFranja = categorias[franja];
                const cantidadRecursos = horarioUsuario[franja.toLowerCase()].length;

                const posiblesRecursos = await resourceSchema.find({
                    categoria: { $in: categoriasFranja }
                });

                const recursosDisponibles = posiblesRecursos.filter(r => !recursosSeleccionados.has(r._id.toString()));
                const recursosBarajados = recursosDisponibles.sort(() => Math.random() - 0.5);
                const seleccionados = recursosBarajados.slice(0, cantidadRecursos);

                seleccionados.forEach(r => recursosSeleccionados.add(r._id.toString()));
                planFinal[franja] = seleccionados;
            }
        }

        const planGenerado = {
            data: planFinal,
            estadoDeAnimo: estado,
        };

        user.planDiario = planGenerado;
        await user.save();

        res.status(200).json({
            message: 'Estado de ánimo actualizado y plan generado exitosamente',
            planDiario: user.planDiario,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado de ánimo y generar el plan', error });
    }
};

// Reorganizar el horario del usuario
exports.reorganizarPlanPorHorario = async (req, res) => {
    try {
        const user = await userSchema.findById(req.userId);

        if (!user || !user.planDiario) {
            return res.status(404).json({ message: 'Usuario o plan no encontrado' });
        }

        const horario = user.horario; 
        const plan = user.planDiario.data;
        const estado = user.planDiario.estadoDeAnimo;

        const categoriasPorEstado = {
            'Muy bien': {
                Manana: ['Podcast', 'Aprender'],
                Tarde: ['Ejercicios de Respiración', 'Música y Sonidos Relajantes'],
                Noche: ['Meditación y Mindfulness'],
            },
            Bien: {
                Manana: ['Meditación y Mindfulness', 'Ejercicios de Respiración'],
                Tarde: ['Aprender', 'Podcast'],
                Noche: ['Meditación y Mindfulness', 'Música y Sonidos Relajantes'],
            },
            Neutro: {
                Manana: ['Podcast', 'Meditación y Mindfulness'],
                Tarde: ['Ejercicios de Respiración', 'Aprender'],
                Noche: ['Meditación y Mindfulness', 'Música y Sonidos Relajantes'],
            },
            Mal: {
                Manana: ['Meditación y Mindfulness', 'Ejercicios de Respiración'],
                Tarde: ['Música y Sonidos Relajantes', 'Podcast'],
                Noche: ['Meditación y Mindfulness'],
            },
            'Muy mal': {
                Manana: ['Meditación y Mindfulness'],
                Tarde: ['Ejercicios de Respiración', 'Podcast'],
                Noche: ['Música y Sonidos Relajantes', 'Aprender'],
            },
        };

        const planReorganizado = { Manana: [], Tarde: [], Noche: [] };
        const recursosUsados = new Set();

       for (const franja of ['Manana', 'Tarde', 'Noche']) {
            const horas = horario[franja.toLowerCase()] || [];
            const actividadesAnteriores = plan[franja] || [];
            const cantidadActual = horas.length;

            if (cantidadActual === 0) {
                continue;
            }

            const nuevasActividades = actividadesAnteriores.slice(0, cantidadActual);
            nuevasActividades.forEach(act => recursosUsados.add(act._id.toString())); 

            const faltan = cantidadActual - nuevasActividades.length;

            if (faltan > 0) {
                const posiblesRecursos = await resourceSchema.find({
                    categoria: { $in: categoriasPorEstado[estado][franja] }
                });

                const disponibles = posiblesRecursos.filter(r => !recursosUsados.has(r._id.toString()));
                const barajados = disponibles.sort(() => Math.random() - 0.5).slice(0, faltan);

                barajados.forEach(r => recursosUsados.add(r._id.toString()));
                nuevasActividades.push(...barajados);
            }

            planReorganizado[franja] = nuevasActividades;
        }

        user.planDiario.data = planReorganizado;
        await user.save();

        res.status(200).json({ message: 'Plan reorganizado según nuevo horario', planDiario: user.planDiario });

    } catch (error) {
        res.status(500).json({ message: 'Error al reorganizar el plan', error });
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
