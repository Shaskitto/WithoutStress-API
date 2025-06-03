const mongoose = require('mongoose');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

function initSocket(io) {
  io.on('connection', (socket) => {

    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('send-message', async ({ roomId, sender, receiver, content }) => {
      try {
        const user = await User.findById(sender);
        if (!user) {
          return socket.emit('error-message', 'Usuario remitente no encontrado.');
        }

        const receiverUser = await User.findById(receiver);

        const isFriendOrPsychologist =
          user.friends.some((f) => f.friendId.toString() === receiver && f.status === 'accepted') ||
          receiverUser.rol === 'psicologo';

        if (!isFriendOrPsychologist) {
          return socket.emit('error-message', 'No puedes chatear con este usuario');
        }

        if (!isFriend) {
          return socket.emit('error-message', 'No puedes chatear con este usuario');
        }

        const message = new Chat({
          roomId,
          sender: sender,
          receiver: receiver,
          content,
          timestamp: new Date()
        });

        await message.save();
        io.to(roomId).emit('new-message', message);

      } catch (err) {
        socket.emit('error-message', 'Ocurrió un error al enviar el mensaje');
      }
    });

    socket.on('disconnect', () => {
    });
  });
}

module.exports = initSocket;
