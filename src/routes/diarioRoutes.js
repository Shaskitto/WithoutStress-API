const express = require('express');
const router = express.Router();
const diarioController = require('../controllers/diarioController');

router.post('/analizar', diarioController.analizarTexto);
router.get('/:userId', diarioController.obtenerEntradas);

module.exports = router;
