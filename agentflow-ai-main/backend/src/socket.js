const { Server } = require('socket.io');
const env = require('./config/env');
const supabase = require('./config/supabase');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.cors.origins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} via socket ${socket.id}`);

    // Join a room specific to this user to receive private updates
    socket.join(`user_${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id} via socket ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
