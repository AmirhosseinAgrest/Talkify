// src/lib/socket.ts

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const createSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

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
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};