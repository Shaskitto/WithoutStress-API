const mongoose = require('mongoose');
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, 
        trim: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, 
        match: [/.+\@.+\..+/, 'El correo electrónico no es válido'],
    },
    password: {
        type: String,
        required: true,
        minlength: 8, 
    },
    nombre_completo:{
          type: String,
          trim: true,
    },
    rol:{
        type: String,
        enum: ['Estudiante', 'Psicologo'],
        default: 'Estudiante', 
    },
    profileImage: {
        type: String,
        default: 'a4dca901ab52c4a6818e250dc6bc7e14.jfif', 
    },
    informacion: {
        type: String,
        trim: true,
        default: 'Sin Información.',
        max: 140
    },
    edad: {
        type: Number,
        min: 0,
    },
    sexo: {
        type: String,
        enum: ['Masculino', 'Femenino'], 
    },
    semestre: {
        type: Number,
        min: 1,
        max: 4,
    },
    carrera: {
        type: String,
        enum: ['Ingeniería de Sistemas', 'Ingeniería Multimedia'], 
    },
    actividades: {
        type: [String],
        enum: ['Meditación', 'Sonidos Relajantes', 'Ejercicios de respiración', 'Prácticas para Dormir'], 
    },
    planDiario: {
        data: {
          Manana: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recurso' }],
          Tarde: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recurso' }],
          Noche: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recurso' }]
        },
        estadoDeAnimo: {
          type: String,
          enum: ['Muy bien', 'Bien', 'Neutro', 'Mal', 'Muy mal']
        }
      },
    friends: [{
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'sent']
        },
        sentAt: {
            type: Date,
            default: Date.now
        },
        acceptedAt: {
            type: Date
        }
    }],
    horario: {
        manana: {
            type: [String], 
            validate: [
                {
                    validator: function(val) {
                        return val.every(hora => /^([0-9]{2}):([0-9]{2})$/.test(hora) && hora >= "06:00" && hora <= "11:59");
                    },
                    message: 'La hora de la mañana debe estar entre 06:00 y 11:59'
                },
                {
                    validator: function(val) {
                        return val.length <= 2;
                    },
                    message: 'Solo se permiten hasta 2 horas en la mañana'
                }
            ]
        },
        tarde: {
            type: [String], 
            validate: [
                {
                    validator: function(val) {
                        return val.every(hora => /^([0-9]{2}):([0-9]{2})$/.test(hora) && hora >= "12:00" && hora <= "17:59");
                    },
                    message: 'La hora de la tarde debe estar entre 12:00 y 17:59'
                },
                {
                    validator: function(val) {
                        return val.length <= 2;
                    },
                    message: 'Solo se permiten hasta 2 horas en la tarde'
                }
            ]
        },
        noche: {
            type: [String], 
            validate: [
                {
                    validator: function(val) {
                        return val.every(hora => /^([0-9]{2}):([0-9]{2})$/.test(hora) && hora >= "18:00" && hora <= "23:59");
                    },
                    message: 'La hora de la noche debe estar entre 18:00 y 23:59'
                },
                {
                    validator: function(val) {
                        return val.length <= 2;
                    },
                    message: 'Solo se permiten hasta 2 horas en la noche'
                }
            ]
        }
    },
    resetPasswordOTP: {
        type: String,
        default: null
    },
    otpExpiration: {
        type: Date,
        default: null
    },
    notasPersonales: [
        {
            titulo: {
                type: String, 
                required: true, 
                trim: true 
            },
            fechaInicio: { 
                type: Date, 
                required: true 
            }, 
            fechaFin: {
                type: Date,
                required: true
            },
            horaInicio: {
                type: String, 
                trim: true,
                required: function () {
                    return !this.allDay; 
                }
            },
            horaFin: {  
                type: String,
                trim: true,
                required: function () {
                    return !this.allDay; 
                }
            },
            allDay: {  
                type: Boolean,
                default: false
            }           
        }
    ],
    estadoDeAnimo: [
        {
            fecha: { 
                type: Date, 
                required: true, 
                default: Date.now 
            },
            estado: { 
                type: String, 
                enum: ['Muy bien', 'Bien', 'Neutro', 'Mal', 'Muy mal'], 
                required: true 
            }
        }
    ]
});

// Middleware para encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);