const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/user');
const { conn, gfs, upload } = require('./db');


const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
app.use('/uploads', express.static('uploads'));

// Rutas
app.get('/', (req, res) => {
    res.send("Welcome to my API");
})

// MongoDB conexión
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

app.listen(port, () => console.log('server listening on port', port));