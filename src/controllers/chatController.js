const chatSchema = require('../models/chatModel');
const userSchema = require('../models/userModel');
const { generateRoomId } = require('../middlewares/chatUtils');

exports.getChat = async (req, res) => {
  const { user1, user2 } = req.params;
  const roomId = generateRoomId(user1, user2);

  const messages = await chatSchema.find({ roomId }).sort({ timestamp: 1 });
  res.json(messages);
};

exports.sendMessage = async (req, res) => {
    const { user1: sender, user2 } = req.params;
    const { content } = req.body;
  
    try {
      const senderUser = await userSchema.findById(sender);
      if (!senderUser) {
        return res.status(404).json({ error: 'Usuario remitente no encontrado.' });
      }
  
      const isFriend = senderUser.friends.some(
        (f) => f.friendId.toString() === user2 && f.status === 'accepted'
      );
  
      if (!isFriend) {
        return res.status(403).json({ error: 'No puedes enviar mensajes a este usuario.' });
      }
  
      const roomId = generateRoomId(sender, user2);
  
      const message = new chatSchema({
        roomId,
        sender,
        content,
        timestamp: new Date()
      });
  
      await message.save();
  
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
  };
  