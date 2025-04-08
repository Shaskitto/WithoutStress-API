const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomId: String,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: String,
  timestamp: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30  }
});

module.exports = mongoose.model('Chat', chatSchema);