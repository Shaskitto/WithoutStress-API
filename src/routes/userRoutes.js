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
 *     security: []
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
 *     security: []
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
 *     security:
 *       - bearerAuth: []  
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
 *     security: []
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
 *     security:
 *       - bearerAuth: []  
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
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *               semestre:
 *                 type: integer
 *                 description: Semestre del usuario (entre 1 y 4)
 *                 minimum: 1
 *                 maximum: 4
 *               carrera:
 *                 type: string
 *                 enum: [Ingeniería de Sistemas, Ingeniería Multimedia]
 *                 description: Carrera del usuario
 *               edad:
 *                 type: integer
 *                 description: Edad del usuario
 *               sexo:
 *                 type: string
 *                 enum: [Masculino, Femenino]
 *                 description: Sexo del usuario
 *               informacion:
 *                 type: string
 *                 maxLength: 140
 *                 description: Información adicional (máximo 140 caracteres)
 *               actividades:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Meditación, Sonidos Relajantes, Ejercicios de respiración, Prácticas para Dormir]
 *                 description: Actividades seleccionadas (puede elegir varias)
 *               horario:
 *                 type: object
 *                 properties:
 *                   mañana:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [06:00-11:59]
 *                     maxItems: 2
 *                     description: Horario preferido en la mañana (máximo 2)
 *                   tarde:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [12:00-17:59]
 *                     maxItems: 2
 *                     description: Horario preferido en la tarde (máximo 2)
 *                   noche:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [18:00-23:59]
 *                     maxItems: 2
 *                     description: Horario preferido en la noche (máximo 2)
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