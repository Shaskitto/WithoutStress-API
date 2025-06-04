const openRouter = require('../middlewares/openRouter');
const DiarioEntry = require('../models/DiarioEntry');

exports.analizarTexto = async (req, res) => {
  const { texto, userId } = req.body; 

  if (!texto || !userId) {
    return res.status(400).json({ error: 'Texto es requerido' });
  }

  try {
    const respuesta = await openRouter.analizarDiario(texto);

    // Guardar en base de datos
    const nuevaEntrada = new DiarioEntry({
      texto,
      respuesta: respuesta.respuesta,
      user: userId,
    });

    await nuevaEntrada.save();

    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al analizar el texto' });
  }
};

exports.obtenerEntradas = async (req, res) => {
  const { userId } = req.params;

  try {
    const entradas = await DiarioEntry.find({ user: userId }).sort({ fecha: -1 });
    res.json(entradas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las entradas del diario' });
  }
};
