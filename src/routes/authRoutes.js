const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rutas relacionadas con la autentificación
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario único del nuevo usuario
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario, debe ser único
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario, debe tener al menos 8 caracteres, incluyendo al menos una letra y un número
 *             required:
 *               - username
 *               - email
 *               - password
 *     examples:
 *       application/json:
 *         username: "nuevoUsuario"
 *         email: "usuario@ejemplo.com"
 *         password: "contraseña123"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario registrado exitosamente'
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: '605c72d80d4b1f001c8b4567'
 *                     username:
 *                       type: string
 *                       example: 'nuevoUsuario'
 *                     email:
 *                       type: string
 *                       example: 'usuario@ejemplo.com'
 *       400:
 *         description: Petición incorrecta (datos inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Datos inválidos, por favor verifica los campos'
 *       409:
 *         description: Conflicto (nombre de usuario o correo ya existentes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'El nombre de usuario o el correo electrónico ya están en uso'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud'
 */
router.post('/register', authController.registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario, debe estar registrado en el sistema
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario, debe tener al menos 8 caracteres
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, retorna un token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para la autenticación de futuras solicitudes
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       401:
 *         description: Credenciales inválidas (usuario no encontrado o contraseña incorrecta)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Credenciales inválidas'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud'
 */
router.post('/login', authController.loginUser);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario registrado en el sistema
 *     responses:
 *       200:
 *         description: Se ha enviado un enlace de restablecimiento de contraseña al correo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.'
 *       404:
 *         description: Correo no encontrado en el sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Correo no encontrado.'
 *       500:
 *         description: Error en el servidor al procesar la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud.'
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/forgot-password/reset:
 *   post:
 *     summary: Restablecer la contraseña del usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 description: Código OTP enviado al usuario para la verificación
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña, debe tener al menos 8 caracteres y contener al menos una letra y un número
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Contraseña restablecida exitosamente'
 *       400:
 *         description: Petición incorrecta (OTP inválido o nueva contraseña no válida)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Código OTP inválido'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud'
 */
router.post('/forgot-password/reset', authController.resetPassword);

/**
 * @swagger
 * /auth/check-username:
 *   get:
 *     summary: Comprobar si un nombre de usuario está disponible
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         description: Nombre de usuario a comprobar
 *         schema:
 *           type: string
 *           example: 'usuario123'
 *     responses:
 *       200:
 *         description: Nombre de usuario disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   example: true
 *                   description: Indica si el nombre de usuario está disponible
 *       409:
 *         description: Nombre de usuario ya existe en el sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   example: false
 *                   description: Indica que el nombre de usuario no está disponible
 *       500:
 *         description: Error en el servidor al procesar la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud.'
 */
router.get('/check-username', authController.checkUsername);

/**
 * @swagger
 * /auth/check-email:
 *   get:
 *     summary: Comprobar si un correo electrónico está disponible
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *           description: Correo electrónico a verificar
 *     responses:
 *       200:
 *         description: Correo electrónico disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'El correo electrónico está disponible'
 *       409:
 *         description: Correo electrónico ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'El correo electrónico ya está registrado'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud'
 */
router.get('/check-email', authController.checkEmail);


module.exports = router;
