const mongoose = require('mongoose');
const path = require('path');
const resourceSchema = require('../models/resourceModel');

// Crear un nuevo recurso
exports.createResource = async (req, res) => {
    try {
        const resourceData = {
            categoria: req.body.categoria,
            titulo: req.body.titulo,
            duracion: req.body.duracion,
            descripcion: req.body.descripcion,
        };

        if (req.file) {
            resourceData.contenido =  `${req.file.filename}`;
        }

        const newResource = new resourceSchema(resourceData);
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

// Obtener el contenido(PDF - Audio) por id
exports.getContent = async (req, res) => {
    const { id } = req.params;

    try {
        const resource = await resourceSchema.findById(id);

        if (!resource || !resource.contenido) {
            return res.status(404).json({ message: 'Contenido no encontrado' });
        }

        const filename = resource.contenido;

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const downloadStream = bucket.openDownloadStreamByName(filename);

        downloadStream.on('error', (err) => {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        });
        
        const extension = path.extname(filename);
        if (extension === '.pdf') {
            res.set('Content-Type', 'application/pdf');
        } else if (extension === '.mp3' || extension === '.mpeg') {
            res.set('Content-Type', 'audio/mpeg');
        } else {
            return res.status(400).json({ message: 'Tipo de archivo no soportado' });
        }


        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el contenido' });
    }
};