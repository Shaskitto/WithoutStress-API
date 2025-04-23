const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authJwt');
const planController = require('../controllers/planController');

/**
 * @swagger
 * tags:
 *   name: Plan
 *   description: Rutas relacionadas con la gestión de planes de usuario
 */

/**
 * @swagger
 * /plan/generar:
 *   post:
 *     summary: Generar un nuevo plan para el usuario basado en su estado de ánimo
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false  // Se puede enviar vacío
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estadoDeAnimo:
 *                 type: string
 *                 description: |
 *                   Estado de ánimo actual del usuario (opcional). 
 *                   Si no se proporciona, se usará el último registrado.
 *                 enum: [Muy bien, Bien, Neutro, Mal, Muy mal]
 *     responses:
 *       200:
 *         description: Plan generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estado de ánimo actualizado y plan generado exitosamente
 *                 planDiario:
 *                   type: object
 *       400:
 *         description: Estado de ánimo no válido o no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Estado de ánimo no válido o no disponible
 *       401:
 *         description: No autorizado, token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No autorizado, por favor inicie sesión
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al actualizar el estado de ánimo y generar el plan
 */
router.post('/generar', verifyToken, planController.generarPlan);

/**
 * @swagger
 * /plan/{userId}:
 *   get:
 *     summary: Obtener el plan de un usuario específico
 *     tags: [Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario cuyo plan se va a obtener
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan:
 *                   type: object
 *                   properties:
 *                     planType:
 *                       type: string
 *                       example: 'Premium'
 *                     duration:
 *                       type: string
 *                       example: '30 días'
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['Acceso completo', 'Soporte premium']
 *       404:
 *         description: Usuario no encontrado o sin plan asociado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuario no encontrado o no tiene plan asociado'
 *       401:
 *         description: No autorizado, token JWT inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No autorizado, por favor inicie sesión'
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al obtener el plan del usuario'
 */
router.get('/:id', verifyToken, planController.obtenerPlan);

module.exports = router;