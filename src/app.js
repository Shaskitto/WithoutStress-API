const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const { connectDB, initGFS } = require('./config/db');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Definición de las opciones de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'WithoutStress API',
            version: '1.0.0',
            description: `
    WithoutStress API es una plataforma integral diseñada para facilitar la gestión del estrés de los usuarios a través de diversas herramientas y recursos. 
    Esta API ofrece funcionalidades clave, incluyendo:

    Objetivo: Este proyecto tiene como finalidad ofrecer a los usuarios acceso a herramientas de relajación y apoyo personal, promoviendo una vida más equilibrada y saludable.
        
    ### Funcionalidades principales:
        - Gestión de Usuarios: Registro, autenticación segura y gestión de perfiles de usuario.
        - Conexiones Sociales: Permite a los usuarios agregar y gestionar amistades o conexiones personales.
        - Carga y Manejo de Recursos: Facilita la subida de archivos y recursos, y su recuperación por categoría e ID, permitiendo a los usuarios acceder a contenidos relevantes de manera eficiente.
        - Documentación Detallada: Proporciona información exhaustiva sobre los endpoints y parámetros disponibles para la interacción con la API.


    ### Autenticación:
        - La API implementa un sistema de autenticación basado en tokens (JWT) para proteger los recursos sensibles y asegurar la privacidad de los usuarios.

    Para más detalles sobre el uso de los diferentes endpoints, consulta las rutas y parámetros documentados a continuación.
    `,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'], 
};


// Generar la especificación de Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Configuración de autenticación básica para /api-docs
const authOptions = {
    users: { 'Admin': 'WS2024' }, 
    challenge: true, 
    unauthorizedResponse: 'Acceso denegado' 
};

// Middleware
app.use(cors());
app.use(express.json());

// Servir la documentación de Swagger
app.use('/api-docs', basicAuth(authOptions), swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/user', userRoutes);    
app.use('/auth', authRoutes);
app.use('/friend', friendRoutes)
app.use('/resource', resourceRoutes)
app.use('/uploads', express.static('uploads'));

// Ruta principal
app.get('/', (req, res) => {
    res.send(`<h1>WithoutStress API</h1><p>Current version: 1.0.0</p>`);
});

// Conectar a MongoDB e inicializar GridFS
connectDB().then(() => {
    initGFS(); 
    console.log('MongoDB connected and GridFS initialized');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Iniciar el servidor
app.listen(port, () => console.log('server listening on port', port));