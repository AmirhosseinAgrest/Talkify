// src/socket/index.js

import { Server } from 'socket.io';
import { verifyToken } from '../services/auth.service.js';
import * as suspensionService from '../services/suspension.service.js';
import { handleConnection, SUSPENDED_MESSAGE } from './handlers.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token was not provided'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.use(async (socket, next) => {
    try {
      const suspension = await suspensionService.checkSuspension(socket.userId);
      if (suspension) {
        return next(new Error(SUSPENDED_MESSAGE));
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    handleConnection(io, socket);
  });

  return io;
};
