const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const basicAuth = require('express-basic-auth');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const planRoutes = require('./routes/planRoutes');
const initSocket = require('./config/socket');
const { connectDB, initGFS } = require('./config/db');

require('dotenv').config();

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const port = process.env.PORT || 10000;

// Definición de las opciones de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'WithoutStress API',
            version: '1.0.0',
            description: `
WithoutStress API es una plataforma diseñada para ayudar a los usuarios a gestionar el estrés a través de diversas herramientas y recursos.  
Esta API proporciona funcionalidades esenciales para mejorar la experiencia del usuario en el ámbito del bienestar y la relajación.

## 📌 Objetivo  
Ofrecer a los usuarios un conjunto de herramientas digitales que promuevan el bienestar emocional, la relajación y el equilibrio personal.

## 🚀 Funcionalidades  
- **Gestión de Usuarios:** Registro, autenticación segura mediante JWT y administración de perfiles.  
- **Conexiones Sociales:** Agregar, gestionar y eliminar amistades para fomentar la interacción entre usuarios.  
- **Manejo de Recursos:** Subida y recuperación de archivos categorizados, proporcionando acceso eficiente a contenido relevante.  
- **Documentación Interactiva:** Descripción detallada de los endpoints, parámetros y esquemas de respuesta.  

## 🔐 Autenticación  
La API implementa autenticación basada en tokens (**JWT**) para proteger los recursos sensibles y garantizar la seguridad de los datos de los usuarios.

Para más detalles sobre el uso de los diferentes endpoints, consulta la documentación a continuación.
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
    users: { 'Admin': 'WS2025' }, 
    challenge: true, 
    unauthorizedResponse: 'Acceso denegado' 
};

// Middleware
app.use(cors());
app.use(express.json());

// Servir la documentación de Swagger
app.use('/api-docs', basicAuth(authOptions), swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas de la API
app.use('/user', userRoutes);    
app.use('/auth', authRoutes);
app.use('/friend', friendRoutes);
app.use('/resource', resourceRoutes);
app.use('/chat', chatRoutes);
app.use('/plan', planRoutes);
app.use('/uploads', express.static('uploads'));

// Ruta principal
app.get('/', (req, res) => {
    res.send(`<h1>WithoutStress API</h1><p>Current version: 1.0.0</p>`);
});

// Mantener activa la API
cron.schedule('*/14 * * * *', () => {
    axios.get('https://withoutstress-api.onrender.com')
    .then(response => {
    console.log('Respuesta de la API:', response.data);
    })
    .catch(error => {
    console.error('Error al hacer la solicitud:', error);
    });
}); 


// Conectar a MongoDB e inicializar GridFS
connectDB().then(() => {
    initGFS(); 
    console.log('MongoDB connected and GridFS initialized');

    // Inicializar Socket.io después de conectar a DB
    initSocket(io);
    
    // Manejo de errores de conexión Socket.io
    io.on('error', (error) => {
        console.error('Socket.IO error:', error);
    });

    // Iniciar el servidor
    server.listen(port, () => {
        console.log('Server listening on port', port);
        console.log(`Socket.IO running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});

// Iniciar el servidor
//server.listen(port, () => console.log('server listening on port', port));