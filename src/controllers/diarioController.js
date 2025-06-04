const openRouter = require('../middlewares/openRouter');

exports.analizarTexto = async (req, res) => {
  const { texto } = req.body;
  if (!texto) {
    return res.status(400).json({ error: 'Texto es requerido' });
  }

  try {
    const respuesta = await geminiService.analizarDiario(texto);
    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al analizar el texto' });
  }
};
