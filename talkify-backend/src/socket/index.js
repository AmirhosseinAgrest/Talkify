// src/socket/index.js

import { Server } from 'socket.io';
import { authenticateToken } from '../services/auth.service.js';
import * as suspensionService from '../services/suspension.service.js';
import { handleConnection, SUSPENDED_MESSAGE } from './handlers.js';

export const initializeSocket = (httpServer, { checkOrigin, originAllowed }) => {
  const io = new Server(httpServer, {
    cors: {
      origin: checkOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    allowRequest: (req, callback) => {
      const allowed = originAllowed(req.headers.origin);
      callback(allowed ? null : 'origin not allowed', allowed);
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token was not provided'));
      }

      const { userId, sessionId } = await authenticateToken(token);
      socket.userId = userId;
      socket.sessionId = sessionId;
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
