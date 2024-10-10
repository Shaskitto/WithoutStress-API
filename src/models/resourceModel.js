const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
    categoria: {
        type: String,
        enum: ['Aprender', 'Meditacion', 'Sonidos Relajantes', 'Ejercicios de respiracion', 'Practicas para Dormir', 'Musica'], 
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    autor: {
        type: String,
        default: 'Without Stress Team'
    },
    duracion: {
        type: Number, 
        required: true
    },
    descripcion:{
        type: String,
        required: true
    },
    contenido: { 
        type: String, 
        required: true 
    }
});

module.exports = mongoose.model('Resource', resourceSchema);