const mongoose = require('mongoose');
const path = require('path');
const resourceSchema = require('../models/resourceModel');

// Crear un nuevo recurso
exports.createResource = async (req, res) => {
    try {
        const { categoria, titulo, duracion, descripcion, mediaType, contenidoUrl, autor } = req.body;

        const newResource = new resourceSchema({
            categoria,
            titulo,
            duracion,
            descripcion,
            mediaType,
            contenidoUrl,
            autor: autor || undefined 
        })

        await newResource.save();

        res.status(201).json(newResource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener recursos
exports.getAllResources = async (req, res) => {
    try {
        const resources = await resourceSchema.find();

        if (!resources || resources.length === 0) {
            return res.status(404).json({ message: 'No se encontraron recursos.' });
        }

        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los recursos.', error: error.message });
    }
};

// Obtener los recursos por categoria
exports.getByCategory = async (req, res) => {
    try {
        const { categoria } = req.params;
        
        const resources = await resourceSchema.find({ categoria }); 

        if (resources.length === 0) {
            return res.status(404).json({ message: 'No se encontraron recursos en esta categoría.' });
        }

        res.status(200).json(resources);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un recurso por id
exports.getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await resourceSchema.findById(id); 

        if (!resource) {
            return res.status(404).json({ message: 'Recurso no encontrado.' });
        }

        res.status(200).json(resource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};