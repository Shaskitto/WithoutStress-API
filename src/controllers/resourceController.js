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
            resourceData.contenido = req.file.id; 
        }

        const newResource = new resourceSchema(resourceData);
        await newResource.save();

        res.status(201).json(newResource);
    } catch (error) {
        res.status(400).json({ error: error.message });
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

        console.log('Recurso encontrado:', resource);
        res.status(200).json(resource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};