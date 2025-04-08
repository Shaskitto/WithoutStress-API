const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authJwt');
const chatController = require('../controllers/chatController');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Rutas relacionadas con la mensajería entre usuarios
 */

/**
 * @swagger
 * /chat/{userId1}/{userId2}:
 *   get:
 *     summary: Obtener el historial de chat entre dos usuarios
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId1
 *         required: true
 *         description: ID del primer usuario
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId2
 *         required: true
 *         description: ID del segundo usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de mensajes entre los usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sender:
 *                     type: string
 *                     example: "605c72d80d4b1f001c8b1234"
 *                   receiver:
 *                     type: string
 *                     example: "605c72d80d4b1f001c8b5678"
 *                   message:
 *                     type: string
 *                     example: "Hola, ¿cómo estás?"
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-04-08T10:00:00.000Z"
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       500:
 *         description: Error en el servidor
 */
router.get('/:user1/:user2', verifyToken, chatController.getChat);

/**
 * @swagger
 * /chat/{userId1}/{userId2}:
 *   post:
 *     summary: Enviar un mensaje de un usuario a otro
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId1
 *         required: true
 *         description: ID del usuario que envía el mensaje
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId2
 *         required: true
 *         description: ID del usuario que recibe el mensaje
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Contenido del mensaje
 *                 example: "Hola, ¿qué tal?"
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sender:
 *                   type: string
 *                   example: "605c72d80d4b1f001c8b1234"
 *                 receiver:
 *                   type: string
 *                   example: "605c72d80d4b1f001c8b5678"
 *                 message:
 *                   type: string
 *                   example: "Hola, ¿qué tal?"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-04-08T10:01:00.000Z"
 *       400:
 *         description: Petición incorrecta (mensaje vacío o datos faltantes)
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       500:
 *         description: Error en el servidor
 */
router.post('/:user1/:user2', verifyToken, chatController.sendMessage);

module.exports = router;
