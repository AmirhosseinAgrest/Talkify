// src/socket/handlers.js

import * as chatService from '../services/chat.service.js';
import * as channelService from '../services/channel.service.js';
import * as db from '../services/db.service.js';
import * as suspensionService from '../services/suspension.service.js';
import { MESSAGE_STATUS } from '../utils/constants.js';

export const SUSPENDED_MESSAGE = 'Your account has been suspended';

const onlineUsers = new Map();

// Re-checks suspension against the server-side state on every protected event so a
// socket that was connected before the user got suspended cannot keep acting.
const requireNotSuspended = (socket, handler) => {
  return async (...args) => {
    try {
      const suspension = await suspensionService.checkSuspension(socket.userId);
      if (suspension) {
        socket.emit('error', { message: SUSPENDED_MESSAGE });
        return;
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
      return;
    }
    await handler(...args);
  };
};

export const handleConnection = (io, socket) => {
  const userId = socket.userId;

  onlineUsers.set(userId, socket.id);
  db.updateUser(userId, { isOnline: true, lastSeen: new Date().toISOString() });
  socket.broadcast.emit('user:online', userId);

  socket.on('chat:join', (chatId) => {
    socket.join(chatId);
  });

  socket.on('chat:leave', (chatId) => {
    socket.leave(chatId);
  });

  socket.on(
    'message:send',
    requireNotSuspended(socket, async ({ chatId, content, replyToId }) => {
      try {
        const message = await chatService.sendMessageWithFile(
          chatId,
          userId,
          content,
          null,
          replyToId
        );
        io.to(chatId).emit('message:receive', message);

        const chat = await db.getChatById(chatId);
        const recipientId = chat.participantIds.find((id) => id !== userId);
        if (onlineUsers.has(recipientId)) {
          await chatService.updateMessageStatus(message.id, MESSAGE_STATUS.DELIVERED);
          io.to(chatId).emit('message:status', {
            messageId: message.id,
            status: MESSAGE_STATUS.DELIVERED,
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    })
  );

  socket.on(
    'message:edit',
    requireNotSuspended(socket, async ({ messageId, content, chatId }) => {
      try {
        const message = await chatService.editMessage(messageId, userId, content);
        io.to(chatId).emit('message:edited', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    })
  );

  socket.on(
    'message:delete',
    requireNotSuspended(socket, async ({ messageId, chatId }) => {
      try {
        const message = await chatService.deleteMessageById(messageId, userId);
        io.to(chatId).emit('message:deleted', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    })
  );

  socket.on(
    'message:reaction:add',
    requireNotSuspended(socket, async ({ messageId, emoji, chatId }) => {
      try {
        const reaction = await chatService.addReaction(messageId, userId, emoji);
        io.to(chatId).emit('message:reaction:added', { messageId, reaction });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    })
  );

  socket.on(
    'message:reaction:remove',
    requireNotSuspended(socket, async ({ messageId, emoji, chatId }) => {
      try {
        await chatService.removeReaction(messageId, userId, emoji);
        io.to(chatId).emit('message:reaction:removed', { messageId, emoji, userId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    })
  );

  socket.on('channel:join', (channelId) => {
    socket.join(`channel:${channelId}`);
  });

  socket.on('channel:leave', (channelId) => {
    socket.leave(`channel:${channelId}`);
  });

  socket.on(
    'channel:message:send',
    requireNotSuspended(socket, async ({ channelId, content }) => {
      try {
        const message = await channelService.sendChannelMessage(channelId, userId, content);
        io.to(`channel:${channelId}`).emit('channel:message:receive', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    })
  );

  socket.on(
    'typing:start',
    requireNotSuspended(socket, ({ chatId, channelId }) => {
      if (chatId) {
        socket.to(chatId).emit('typing:start', { userId, chatId });
      }
      if (channelId) {
        socket.to(`channel:${channelId}`).emit('typing:start', { userId, channelId });
      }
    })
  );

  socket.on(
    'typing:stop',
    requireNotSuspended(socket, ({ chatId, channelId }) => {
      if (chatId) {
        socket.to(chatId).emit('typing:stop', { userId, chatId });
      }
      if (channelId) {
        socket.to(`channel:${channelId}`).emit('typing:stop', { userId, channelId });
      }
    })
  );

  socket.on('disconnect', async () => {
    onlineUsers.delete(userId);
    await db.updateUser(userId, {
      isOnline: false,
      lastSeen: new Date().toISOString(),
    });
    socket.broadcast.emit('user:offline', userId);
  });
};
