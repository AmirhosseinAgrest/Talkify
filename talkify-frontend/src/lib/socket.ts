// src/lib/socket.ts

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const createSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  console.log('🔌 Creating socket with token:', token ? 'Token exists' : 'No token!');

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = (): void => {
  if (socket && !socket.connected) {
    console.log('🔌 Connecting socket...');
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};