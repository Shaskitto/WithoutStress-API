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
 * /resource/{ResourceId}/contenido:
 *   get:
 *     summary: Obtener el contenido de un recurso por ID
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
 *         description: Contenido del recurso obtenido exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Contenido del recurso en formato PDF
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Contenido del recurso en formato de audio
 *       400:
 *         description: Petición incorrecta (ID inválido)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'ID del recurso inválido'
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
router.get("/:id/contenido", verifyToken, resourceController.getContent);

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               contenido:
 *                 type: string
 *                 format: binary
 *                 description: Contenido del recurso a crear (archivo o datos)
 *               categoria:
 *                 type: string
 *                 enum: ['Aprender', 'Meditación', 'Sonidos Relajantes', 'Ejercicios de respiración', 'Prácticas para Dormir', 'Musica']
 *                 description: Categoría del recurso
 *               titulo:
 *                 type: string
 *                 description: Título del recurso
 *               duracion:
 *                 type: string
 *                 description: Duración del recurso
 *               descripcion:
 *                 type: string
 *                 description: Descripción del recurso
 *     responses:
 *       201:
 *         description: Recurso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID del recurso creado
 *                 message:
 *                   type: string
 *                   example: 'Recurso creado exitosamente'
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
router.post("/create", upload.single("contenido"), resourceController.createResource);

module.exports = router;