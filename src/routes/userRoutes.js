const express = require('express');
const router = express.Router();
const { upload } = require('../config/db');
const verifyToken = require('../middlewares/authJwt');
const userController = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Rutas relacionadas con los usuarios
 */

/**
 * @swagger
 * /user/upload:
 *   post:
 *     summary: Subir una imagen de perfil
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de perfil del usuario
 *     responses:
 *       201:
 *         description: Imagen de perfil subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Imagen de perfil subida con éxito.'
 *       400:
 *         description: Petición incorrecta (datos inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Datos inválidos, por favor verifica los campos.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al procesar la solicitud.'
 */
router.post('/upload', upload.single('profileImage'), userController.uploadImage);

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a obtener
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Token JWT del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado'
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
router.get('/:id', verifyToken, userController.getUserById);

/**
 * @swagger
 * /user/{id}/profile-image:
 *   get:
 *     summary: Obtener la imagen de perfil de un usuario
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Imagen de perfil obtenida exitosamente
 *         content:
 *           image/jpeg:  
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado'
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
router.get('/:id/profile-image', userController.getProfileImage);

/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Actualizar un usuario por ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a actualizar
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Token JWT del usuario
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de perfil del usuario (opcional)
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del usuario
 *                 profileImage:
 *                   type: string
 *                   description: URL de la nueva imagen de perfil
 *             example:
 *               id: "123456789"
 *               profileImage: "https://example.com/images/profile123456789.jpg"
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
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado'
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
router.patch('/:id', verifyToken, upload.single('profileImage'), userController.updateUserById);

module.exports = router;