import { Server } from 'socket.io';
import env from '~/config/env';

const initSocket = (server: any) => {
  console.log('Socket server running');

  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', env.CLIENT_URL as string],
      credentials: true
    }
  });
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('notification', (data) => {
      console.log('Notification received', data);

      io.emit('newNotification', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

export default initSocket;
