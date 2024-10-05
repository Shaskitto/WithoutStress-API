const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
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
          WithoutStress API es una plataforma diseñada para ayudar a los usuarios a gestionar el estrés a través de diversas funcionalidades.
          Esta API proporciona acceso a herramientas como la creación de perfiles de usuario, autenticación segura, manejo de amistades y relaciones entre usuarios,
          así como la carga y gestión de archivos (imágenes y documentos) para personalizar la experiencia del usuario.
          
          ### Funcionalidades principales:
          - Gestión de usuarios: Registro, autenticación y perfil de usuario.
          - Manejo de relaciones: Agregar y gestionar amigos o conexiones.
          - Carga y manejo de archivos: Permite la subida de imágenes de perfil y otros archivos de interés.
          - Documentación detallada de los endpoints y parámetros disponibles para interactuar con la API.

          Este proyecto tiene como objetivo ofrecer una plataforma robusta para el manejo del estrés, brindando a los usuarios acceso a herramientas de relajación y apoyo personal.

          ### Autenticación:
          - La API utiliza autenticación por tokens (JWT) para la protección de los recursos sensibles.

          Para más detalles sobre cómo usar los diferentes endpoints, revisa las rutas y parámetros documentados a continuación.`,
      }
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