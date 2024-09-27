const express = require('express');
const router = express.Router();
const { upload } = require('../config/db');
const verifyToken = require('../middlewares/authJwt');
const userController = require('../controllers/userController');

// Rutas relacionadas con los usuarios
router.get('/users', userController.getAllUsers);
router.get('/user/:id', verifyToken, userController.getUserById);
router.patch('/user/:id', verifyToken, upload.single('profileImage'), userController.updateUserById);
router.get('/user/:id/profile-image', userController.getProfileImage);
router.post('/upload', upload.single('profileImage'), userController.uploadImage);

module.exports = router;