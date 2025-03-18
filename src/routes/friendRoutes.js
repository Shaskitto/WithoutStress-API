const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authJwt');
const friendController = require('../controllers/friendController');

/**
 * @swagger
 * tags:
 *   name: Friend
 *   description: Rutas relacionadas con los amigos de los usuarios
 */

/**
 * @swagger
 * /friend/search-friends/{username}:
 *   get:
 *     summary: Buscar amigos por nombre de usuario
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: Nombre de usuario del amigo a buscar
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Amigo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "1234567890abcdef"
 *                 username:
 *                   type: string
 *                   example: "amigo123"
 *                 profileImage:
 *                   type: string
 *                   example: "profile-image-url.jpg"
 *       404:
 *         description: Amigo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Amigo no encontrado.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al buscar el amigo.'
 */
router.get('/search-friends/:username', verifyToken, friendController.searchFriend);

/**
 * @swagger
 * /friend/request/pending/{UserId}:
 *   get:
 *     summary: Obtener solicitudes de amistad pendientes
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         required: true
 *         description: ID del usuario 
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitudes de amistad pendientes obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   friendId:
 *                     type: string
 *                     example: "60b8d7f1e6d6b52a2f5a7e65"
 *                   username:
 *                     type: string
 *                     example: "nuevo_amigo"
 *                   status:
 *                     type: string
 *                     example: "pending"
 *                   sentAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-10-05T12:34:56Z"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al obtener las solicitudes de amistad pendientes.'
 */
router.get('/request/pending/:id', verifyToken, friendController.getPendingRequests);

/**
 * @swagger
 * /friend/{UserId}:
 *   get:
 *     summary: Obtener amigos de un usuario
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de amigos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   friendId:
 *                     type: string
 *                     example: "60b8d7f1e6d6b52a2f5a7e65"
 *                   username:
 *                     type: string
 *                     example: "amigo1"
 *                   profileImage:
 *                     type: string
 *                     example: "image_url.jpg"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al obtener la lista de amigos.'
 */
router.get('/:id', verifyToken, friendController.getFriends);

/**
 * @swagger
 * /friend/request/{UserId}:
 *   post:
 *     summary: Enviar una solicitud de amistad
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         required: true
 *         description: ID del usuario
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
 *               friendId:
 *                 type: string
 *                 description: ID del usuario que se quiere agregar como amigo
 *     responses:
 *       200:
 *         description: Solicitud de amistad enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Solicitud de amistad enviada correctamente.'
 *       400:
 *         description: Petición incorrecta (datos inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'ID de usuario o amigo es requerido.'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al enviar la solicitud de amistad.'
 */
router.post('/request/:id', verifyToken, friendController.sendRequest);

/**
 * @swagger
 * /friend/request/accept/{UserId}:
 *   post:
 *     summary: Aceptar una solicitud de amistad
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         required: true
 *         description: ID del usuario
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
 *               friendId:
 *                 type: string
 *                 description: ID del usuario que se quiere aceptar la solicitud
 *     responses:
 *       200:
 *         description: Solicitud de amistad aceptada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Solicitud de amistad aceptada exitosamente.'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Solicitud no encontrada.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al aceptar la solicitud de amistad.'
 */
router.post('/request/accept/:id', verifyToken, friendController.acceptRequest);

/**
 * @swagger
 * /friend/request/decline/{UserId}:
 *   post:
 *     summary: Rechazar una solicitud de amistad
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: UserId
 *         required: true
 *         description: ID del usuario
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
 *               friendId:
 *                 type: string
 *                 description: ID del usuario que se quiere rechazar la solicitud
 *     responses:
 *       200:
 *         description: Solicitud de amistad rechazada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Solicitud de amistad rechazada exitosamente.'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Solicitud no encontrada.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al rechazar la solicitud de amistad.'
 */
router.post('/request/decline/:id', verifyToken, friendController.declineRequest);

/**
 * @swagger
 * /friend/{FriendId}:
 *   delete:
 *     summary: Eliminar un amigo
 *     tags: [Friend]
 *     parameters:
 *       - in: path
 *         name: FriendId
 *         required: true
 *         description: ID del usuario a eliminar
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Amigo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Amigo eliminado exitosamente.'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado.'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al eliminar el amigo.'
 */
router.post('/:id', verifyToken, friendController.deleteFriend);

module.exports = router;