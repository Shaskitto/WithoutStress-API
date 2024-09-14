const express = require('express');
const router = express.Router();
const { upload } = require('../config/db');
const verifyToken = require('../middlewares/authJwt');
const userController = require('../controllers/userController');

// Rutas relacionadas con los usuarios
router.post('/user/register', userController.registerUser);
router.post('/user/login', userController.loginUser);
router.post('/user/forgot-password', userController.forgotPassword);
router.post('/user/forgot-password/reset', userController.resetPassword);
router.get('/users', userController.getAllUsers);
router.get('/user/:id', verifyToken, userController.getUserById);
router.patch('/user/:id', verifyToken, upload.single('profileImage'), userController.updateUserById);
router.get('/user/:id/profile-image', userController.getProfileImage);
router.post('/upload', upload.single('profileImage'), userController.uploadImage);

module.exports = router;