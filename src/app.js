const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const { connectDB, initGFS } = require('./config/db');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', friendRoutes)
app.use('/api/uploads', express.static('uploads'));

// Rutas
app.get('/', (req, res) => {
    res.send("Welcome to my API");
})

// Conectar a MongoDB e inicializar GridFS
connectDB().then(() => {
    initGFS(); 
    console.log('MongoDB connected and GridFS initialized');
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

// Iniciar el servidor
app.listen(port, () => console.log('server listening on port', port));