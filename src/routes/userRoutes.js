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
 * /user/{userId}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
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
 * /user/{userId}/profile-image:
 *   get:
 *     summary: Obtener la imagen de perfil de un usuario
 *     tags: [User]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 * /user/notes/{userId}:
 *   get:
 *     summary: Obtener todas las notas personales de un usuario
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario para obtener sus notas
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fecha:
 *                         type: string
 *                         format: date
 *                         example: "2025-04-10"
 *                       contenido:
 *                         type: string
 *                         example: "Revisión del proyecto final"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al procesar la solicitud"
 */
router.get('/notes/:id', verifyToken, userController.getNotes);

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
 * /user/mood/{userId}:
 *   post:
 *     summary: Registrar estado de ánimo del usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario que registra su estado de ánimo.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: ["Muy bien", "Bien", "Neutro", "Mal", "Muy mal"]
 *                 description: Estado de ánimo del usuario.
 *                 example: "Bien"
 *     responses:
 *       200:
 *         description: Estado de ánimo registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Estado de ánimo registrado con éxito."
 *                 estadoDeAnimo:
 *                   type: object
 *                   properties:
 *                     estado:
 *                       type: string
 *                       example: "Bien"
 *                     fecha:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-03-18T14:30:00.000Z"
 *       400:
 *         description: Petición incorrecta (estado de ánimo inválido).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El estado de ánimo proporcionado no es válido."
 *       404:
 *         description: Usuario no encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado."
 *       500:
 *         description: Error en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al procesar la solicitud."
 */
router.post('/mood/:id', verifyToken, userController.registerMood )

/**
 * @swagger
 * /user/notes/{userId}:
 *   post:
 *     summary: Agregar una nota personal a un usuario
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario al que se le agregará la nota
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título de la nota.
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la nota en formato YYYY-MM-DD.
 *               horaInicio:
 *                 type: string
 *                 description: Hora de inicio en formato HH:mm (opcional si allDay es true).
 *               horaFin:
 *                 type: string
 *                 description: Hora de finalización en formato HH:mm (opcional si allDay es true).
 *               allDay:
 *                 type: boolean
 *                 description: Indica si la nota es de todo el día.
 *     responses:
 *       201:
 *         description: Nota agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nota agregada correctamente"
 *                 nota:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                       example: "Revisión del proyecto"
 *                     fecha:
 *                       type: string
 *                       format: date
 *                       example: "2025-04-10"
 *                     horaInicio:
 *                       type: string
 *                       example: "14:30"
 *                     horaFin:
 *                       type: string
 *                       example: "15:30"
 *                     allDay:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Petición incorrecta (datos inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El título y fecha son obligatorios"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al procesar la solicitud"
 */
router.post('/notes/:id', verifyToken, userController.createNotes);

/**
 * @swagger
 * /user/{userId}:
 *   patch:
 *     summary: Actualizar un usuario por ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
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

/**
 * @swagger
 * /user/notes/{userId}/{noteId}:
 *   patch:
 *     summary: Actualizar una nota específica de un usuario
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario propietario de la nota
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         description: ID de la nota a actualizar
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Nuevo título de la nota.
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de la nota en formato YYYY-MM-DD.
 *               horaInicio:
 *                 type: string
 *                 description: Nueva hora de inicio en formato HH:mm (opcional si allDay es true).
 *               horaFin:
 *                 type: string
 *                 description: Nueva hora de finalización en formato HH:mm (opcional si allDay es true).
 *               allDay:
 *                 type: boolean
 *                 description: Indica si la nota es de todo el día.
 *     responses:
 *       200:
 *         description: Nota actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nota actualizada correctamente"
 *                 nota:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                     fecha:
 *                       type: string
 *                       format: date
 *                     horaInicio:
 *                       type: string
 *                     horaFin:
 *                       type: string
 *                     allDay:
 *                       type: boolean
 *       400:
 *         description: Petición incorrecta (datos inválidos)
 *       404:
 *         description: Usuario o nota no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.patch('/notes/:id/:noteId', verifyToken, userController.updateNotes);

/**
 * @swagger
 * /user/notes/{userId}/{noteId}:
 *   delete:
 *     summary: Eliminar una nota específica de un usuario
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario propietario de la nota
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         description: ID de la nota a eliminar
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nota eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nota eliminada correctamente"
 *       404:
 *         description: Usuario o nota no encontrada
 *       500:
 *         description: Error en el servidor
 */
router.delete('/notes/:id/:noteId', verifyToken, userController.deleteNotes);

module.exports = router;