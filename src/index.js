const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user');
const { connectDB, initGFS, gfs, upload } = require('./db');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api/uploads', express.static('uploads'));

// Rutas
app.get('/', (req, res) => {
    res.send("Welcome to my API");
})

// Conectar a MongoDB y inicializar GridFS
connectDB().then(() => {
    initGFS(); 
    console.log('MongoDB connected and GridFS initialized');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Iniciar el servidor
app.listen(port, () => console.log('server listening on port', port));