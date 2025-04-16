const express = require("express");
const router = express.Router();
const { upload } = require("../config/db");
const verifyToken = require("../middlewares/authJwt");
const resourceController = require("../controllers/resourceController");

/**
 * @swagger
 * tags:
 *   name: Resource
 *   description: Rutas relacionadas con los recusos
 */

/**
 * @swagger
 * /resource:
 *   get:
 *     summary: Obtener todos los recursos
 *     tags: [Resource]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de recursos obtenida exitosamente
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
router.get("/", resourceController.getAllResources);

/**
 * @swagger
 * /resource/categoria/{categoria}:
 *   get:
 *     summary: Obtener recursos por categoría
 *     tags: [Resource]
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         description: Categoría de recursos a obtener
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recursos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   contenido:
 *                     type: string
 *                   categoria:
 *                     type: string
 *       404:
 *         description: No se encontraron recursos en la categoría especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No se encontraron recursos en esta categoría'
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
router.get("/categoria/:categoria", verifyToken, resourceController.getByCategory);

/**
 * @swagger
 * /resource/{ResourceId}:
 *   get:
 *     summary: Obtener un recurso por ID
 *     tags: [Resource]
 *     parameters:
 *       - in: path
 *         name: ResourceId
 *         required: true
 *         description: ID del recurso a obtener
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recurso obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 contenido:
 *                   type: string
 *                 categoria:
 *                   type: string
 *       404:
 *         description: Recurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Recurso no encontrado'
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
router.get("/:id", verifyToken, resourceController.getResourceById);

/**
 * @swagger
 * /resource/create:
 *   post:
 *     summary: Crear un nuevo recurso
 *     tags: [Resource]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoria
 *               - titulo
 *               - duracion
 *               - descripcion
 *               - mediaType
 *               - contenidoUrl
 *             properties:
 *               categoria:
 *                 type: string
 *                 enum: ['Aprender', 'Meditación y Mindfulness', 'Música y Sonidos Relajantes', 'Prácticas para Dormir', 'Ejercicios de Respiración', 'Podcast']
 *                 description: Categoría del recurso
 *                 example: 'Meditación y Mindfulness'
 *               titulo:
 *                 type: string
 *                 description: Título del recurso
 *                 example: 'Meditación guiada para principiantes'
 *               duracion:
 *                 type: number
 *                 description: Duración en minutos
 *                 example: 15
 *               descripcion:
 *                 type: string
 *                 description: Descripción del recurso
 *                 example: 'Una sesión de meditación guiada para ayudar a reducir el estrés'
 *               mediaType:
 *                 type: string
 *                 enum: ['youtube', 'pdf']
 *                 description: Tipo de contenido multimedia
 *                 example: 'youtube'
 *               contenidoUrl:
 *                 type: string
 *                 description: ID de YouTube o enlace a PDF
 *                 example: '4j6Ej2Ny6wo'
 *               autor:
 *                 type: string
 *                 description: Autor del recurso (opcional, default: Without Stress Team)
 *                 example: 'Equipo de Bienestar'
 *     responses:
 *       201:
 *         description: Recurso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Petición incorrecta (datos inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Datos inválidos, por favor verifica los campos'
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
router.post("/create", resourceController.createResource);

module.exports = router;