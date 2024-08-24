const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    profileImage: {
        type: String,
        default: 'https://i.pinimg.com/736x/25/ee/de/25eedef494e9b4ce02b14990c9b5db2d.jpg', 
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
        enum: ['Meditación', 'Sonidos Relajantes', 'Ejercicios para dormir', 'Prácticas para Dormir'], 
    }
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