const mongoose = require('mongoose');

const DiarioEntrySchema = new mongoose.Schema({
  texto: { type: String, required: true },
  respuesta: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DiarioEntry', DiarioEntrySchema);
