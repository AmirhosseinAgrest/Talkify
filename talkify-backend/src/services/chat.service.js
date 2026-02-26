// src/services/chat.service.js

import { v4 as uuidv4 } from 'uuid';
import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';
import { MESSAGE_STATUS, MESSAGE_TYPE } from '../utils/constants.js';
import * as systemService from './system.service.js';

export const getUserChats = async (userId) => {
  const chats = await db.getChatsByUserId(userId);

  const populatedChats = await Promise.all(
    chats.map(async (chat) => {
      const participants = await Promise.all(
        chat.participantIds.map(async (id) => {
          const user = await db.getUserById(id);
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
          return null;
        })
      );

      const messages = await db.getMessagesByChatId(chat.id);
      const lastMessage = messages[messages.length - 1] || null;

      const unreadCount = messages.filter(
        (msg) => msg.senderId !== userId && msg.status !== MESSAGE_STATUS.SEEN
      ).length;

      return {
        ...chat,
        participants: participants.filter(Boolean),
        lastMessage,
        unreadCount,
      };
    })
  );

  return populatedChats.sort((a, b) => {
    const dateA = a.lastMessage?.createdAt || a.createdAt;
    const dateB = b.lastMessage?.createdAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  });
};

export const getChatById = async (chatId, userId) => {
  const chat = await db.getChatById(chatId);
  if (!chat) {
    throw formatError('Chat not found', 404);
  }

  if (!chat.participantIds.includes(userId)) {
    throw formatError('You do not have access to this chat', 403);
  }

  const participants = await Promise.all(
    chat.participantIds.map(async (id) => {
      const user = await db.getUserById(id);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    })
  );

  return {
    ...chat,
    participants: participants.filter(Boolean),
  };
};

export const createChat = async (userId, participantId) => {
  if (userId === participantId) {
    throw formatError('Cannot create chat with yourself', 400);
  }

  const participant = await db.getUserById(participantId);
  if (!participant) {
    throw formatError('User not found', 404);
  }

  const existingChat = await db.getChatByParticipants(userId, participantId);
  if (existingChat) {
    return await getChatById(existingChat.id, userId);
  }

  const newChat = {
    id: uuidv4(),
    participantIds: [userId, participantId],
    type: 'private',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createChat(newChat);

  return await getChatById(newChat.id, userId);
};

export const getChatMessages = async (chatId, userId) => {
  const chat = await db.getChatById(chatId);
  if (!chat) {
    throw formatError('Chat not found', 404);
  }

  if (!chat.participantIds.includes(userId)) {
    throw formatError('You do not have access to this chat', 403);
  }

  const messages = await db.getMessagesByChatId(chatId);

  await Promise.all(
    messages
      .filter(
        (msg) =>
          msg.senderId !== userId &&
          msg.status !== MESSAGE_STATUS.SEEN
      )
      .map((msg) =>
        db.updateMessageStatus(msg.id, MESSAGE_STATUS.SEEN)
      )
  );

  return messages;
};

export const sendMessage = async (chatId, senderId, content, type = MESSAGE_TYPE.TEXT) => {

  const chat = await db.getChatById(chatId);
  if (!chat) {
    throw formatError('Chat not found', 404);
  }

  if (!chat.participantIds.includes(senderId)) {
    throw formatError('You do not have access to this chat', 403);
  }

  const isSystem = await systemService.isSystemChat(chatId);
  if (isSystem) {
    const isSender = await systemService.isSystemUser(senderId);
    if (!isSender) {
      throw formatError('You cannot send messages to the support account', 403);
    }
  }

  const newMessage = {
    id: uuidv4(),
    chatId,
    senderId,
    content,
    type,
    status: MESSAGE_STATUS.SENT,
    createdAt: new Date().toISOString(),
  };

  await db.createMessage(newMessage);

  await db.updateChat(chatId, {
    updatedAt: new Date().toISOString(),
  });

  return newMessage;
};

export const updateMessageStatus = async (messageId, status) => {
  const message = await db.updateMessageStatus(messageId, status);
  if (!message) {
    throw formatError('Message not found', 404);
  }
  return message;
};

export const editMessage = async (messageId, userId, newContent) => {
  const message = await db.getMessageById(messageId);
  if (!message) {
    throw formatError('Message not found', 404);
  }

  if (message.senderId !== userId) {
    throw formatError('You cannot edit this message', 403);
  }

  if (message.isDeleted) {
    throw formatError('This message has been deleted', 400);
  }

  const updatedMessage = await db.updateMessage(messageId, {
    content: newContent,
    isEdited: true,
    updatedAt: new Date().toISOString(),
  });

  return updatedMessage;
};

export const deleteMessageById = async (messageId, userId) => {
  const message = await db.getMessageById(messageId);
  if (!message) {
    throw formatError('Message not found', 404);
  }

  if (message.senderId !== userId) {
    throw formatError('You cannot delete this message', 403);
  }

  const updatedMessage = await db.updateMessage(messageId, {
    isDeleted: true,
    content: 'This message has been deleted',
    updatedAt: new Date().toISOString(),
  });

  return updatedMessage;
};

export const addReaction = async (messageId, userId, emoji) => {
  const message = await db.getMessageById(messageId);
  if (!message) {
    throw formatError('Message not found', 404);
  }

  const reaction = {
    id: uuidv4(),
    messageId,
    userId,
    emoji,
    createdAt: new Date().toISOString(),
  };

  await db.addReaction(reaction);
  return reaction;
};

export const removeReaction = async (messageId, userId, emoji) => {
  await db.removeReaction(messageId, userId, emoji);
};

export const getReplyMessage = async (messageId) => {
  if (!messageId) return null;
  return await db.getMessageById(messageId);
};

export const sendMessageWithFile = async (chatId, senderId, content, file, replyToId = null) => {
  const chat = await db.getChatById(chatId);
  if (!chat) {
    throw formatError('Chat not found', 404);
  }

  if (!chat.participantIds.includes(senderId)) {
    throw formatError('You do not have access to this chat', 403);
  }
  let replyTo = null;
  if (replyToId) {
    const replyMessage = await db.getMessageById(replyToId);
    if (replyMessage) {
      replyTo = {
        id: replyMessage.id,
        content: replyMessage.content,
        type: replyMessage.type,
        senderId: replyMessage.senderId,
      };
    }
  }

  const newMessage = {
    id: uuidv4(),
    chatId,
    senderId,
    content: content || '',
    type: file?.type || MESSAGE_TYPE.TEXT,
    fileUrl: file?.url || null,
    fileName: file?.name || null,
    fileSize: file?.size || null,
    replyToId: replyToId || null,
    replyTo: replyTo,
    isEdited: false,
    isDeleted: false,
    reactions: [],
    status: MESSAGE_STATUS.SENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createMessage(newMessage);

  await db.updateChat(chatId, {
    updatedAt: new Date().toISOString(),
  });

  return newMessage;
};

export const canSendMessage = async (chatId, senderId) => {
  const isSystem = await systemService.isSystemChat(chatId);
  if (isSystem) {
    const isSender = await systemService.isSystemUser(senderId);
    return isSender;
  }
  return true;
};

export const findOrCreateChat = async (userId, targetUserId) => {
  const targetUser = await db.getUserById(targetUserId);
  if (!targetUser) {
    throw formatError('User not found', 404);
  }

  if (userId === targetUserId) {
    throw formatError('Cannot chat with yourself', 400);
  }

  const existingChat = await db.getChatByParticipants(userId, targetUserId);
  if (existingChat) {
    return await getChatById(existingChat.id, userId);
  }

  const newChat = {
    id: uuidv4(),
    participantIds: [userId, targetUserId],
    type: 'private',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createChat(newChat);

  return await getChatById(newChat.id, userId);
};