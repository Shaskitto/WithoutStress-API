const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema({
    categoria: {
        type: String,
        enum: ['Aprender', 'Meditación y Mindfulness', 'Música y Sonidos Relajantes', 'Prácticas para Dormir', 'Ejercicios de Respiración', 'Podcast'], 
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
    mediaType: {
        type: String,
        enum: ['youtube', 'pdf'],
        required: true
    },
    contenidoUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Resource', resourceSchema);