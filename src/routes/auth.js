const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas relacionadas con la autentificación
router.post('/auth/register', authController.registerUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/forgot-password/reset', authController.resetPassword);

module.exports = router;