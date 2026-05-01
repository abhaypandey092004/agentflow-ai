import { io } from 'socket.io-client';
import { supabase } from './supabase';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
let socket = null;

export const initSocket = async () => {
  if (socket) return socket;

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    console.error('Cannot initialize socket without auth token');
    return null;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: session.access_token
    }
  });

  socket.on('connect', () => {
    console.log('Connected to realtime socket');
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
