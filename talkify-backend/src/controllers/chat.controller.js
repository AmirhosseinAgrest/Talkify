// src/controllers/chat.controller.js

import * as db from '../services/db.service.js';
import * as chatService from '../services/chat.service.js';
import { formatResponse } from '../utils/helpers.js';
import { getMessageType } from '../middleware/upload.middleware.js';

export const getChats = async (req, res, next) => {
  try {
    const chats = await chatService.getUserChats(req.userId);
    res.json(formatResponse(true, chats));
  } catch (error) {
    next(error);
  }
};

export const getChat = async (req, res, next) => {
  try {
    const chat = await chatService.getChatById(req.params.chatId, req.userId);
    res.json(formatResponse(true, chat));
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json(
        formatResponse(false, null, 'User ID is required')
      );
    }

    const chat = await chatService.createChat(req.userId, participantId);
    res.status(201).json(formatResponse(true, chat));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getChatMessages(req.params.chatId, req.userId);
    res.json(formatResponse(true, messages));
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json(
        formatResponse(false, null, 'Message content is required')
      );
    }

    const message = await chatService.sendMessage(
      req.params.chatId,
      req.userId,
      content
    );
    res.status(201).json(formatResponse(true, message));
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json(
        formatResponse(false, null, 'Message content is required')
      );
    }

    const message = await chatService.editMessage(
      req.params.messageId,
      req.userId,
      content
    );

    res.json(formatResponse(true, message, 'Message edited'));
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const message = await chatService.deleteMessageById(
      req.params.messageId,
      req.userId
    );

   res.json(formatResponse(true, message, 'Message deleted'));
  } catch (error) {
    next(error);
  }
};

export const addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json(
        formatResponse(false, null, 'Emoji is required')
      );
    }

    const reaction = await chatService.addReaction(
      req.params.messageId,
      req.userId,
      emoji
    );

    res.status(201).json(formatResponse(true, reaction));
  } catch (error) {
    next(error);
  }
};

export const removeReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;

    await chatService.removeReaction(
      req.params.messageId,
      req.userId,
      emoji
    );

    res.json(formatResponse(true, null, 'Reaction removed'));
  } catch (error) {
    next(error);
  }
};

export const sendMessageWithFile = async (req, res, next) => {
  try {
    const { content, replyToId } = req.body;
    const file = req.file;

    let fileData = null;
    if (file) {
      const type = getMessageType(file.mimetype);
      fileData = {
        type,
        url: `/uploads/${type}s/${file.filename}`,
        name: file.originalname,
        size: file.size,
      };
    }

    const message = await chatService.sendMessageWithFile(
      req.params.chatId,
      req.userId,
      content,
      fileData,
      replyToId
    );

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.chatId).emit('message:receive', message);
    }

    res.status(201).json(formatResponse(true, message));
  } catch (error) {
    next(error);
  }
};

export const findOrCreateChat = async (req, res, next) => {
  try {
    const { userId, username } = req.body;
    let targetUserId = userId;

    if (username && !userId) {
      const users = await db.getUsers();
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (!user) {
        return res.status(404).json(
          formatResponse(false, null, 'User not found with this username')
        );
      }
      targetUserId = user.id;
    }

    if (!targetUserId) {
      return res.status(400).json(
        formatResponse(false, null, 'Either userId or username is required')
      );
    }

    const user = await db.getUserById(targetUserId);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, null, 'User not found')
      );
    }

    if (targetUserId === req.userId) {
      return res.status(400).json(
        formatResponse(false, null, 'Cannot create chat with yourself')
      );
    }

    const chat = await chatService.findOrCreateChat(req.userId, targetUserId);
    res.status(201).json(formatResponse(true, chat));
    
  } catch (error) {
    next(error);
  }
};