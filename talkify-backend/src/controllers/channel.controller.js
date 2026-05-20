// src/controllers/channel.controller.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as channelService from '../services/channel.service.js';
import { formatResponse } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../data/uploads');

export const createChannel = async (req, res, next) => {
  try {
    const { name, username, description, avatar } = req.body;

    if (!name || !username) {
      return res.status(400).json(
        formatResponse(false, null, 'Channel name and username are required')
      );
    }

    const channel = await channelService.createChannel(req.userId, {
      name,
      username,
      description,
      avatar,
    });

    res.status(201).json(formatResponse(true, channel, 'Channel created'));
  } catch (error) {
    next(error);
  }
};

export const getMyChannels = async (req, res, next) => {
  try {
    const channels = await channelService.getUserChannels(req.userId);
    res.json(formatResponse(true, channels));
  } catch (error) {
    next(error);
  }
};

export const getChannelByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const channel = await channelService.getChannelByUsername(
      username,
      req.userId
    );
    res.json(formatResponse(true, channel));
  } catch (error) {
    next(error);
  }
};

export const getChannel = async (req, res, next) => {
  try {
    const channel = await channelService.getChannelById(
      req.params.channelId,
      req.userId
    );
    res.json(formatResponse(true, channel));
  } catch (error) {
    next(error);
  }
};

export const joinChannel = async (req, res, next) => {
  try {
    const channel = await channelService.joinChannel(
      req.params.channelId,
      req.userId
    );
    res.json(formatResponse(true, channel, 'Joined the channel'));
  } catch (error) {
    next(error);
  }
};

export const leaveChannel = async (req, res, next) => {
  try {
    const channel = await channelService.leaveChannel(
      req.params.channelId,
      req.userId
    );
    res.json(formatResponse(true, channel, 'Left the channel'));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const messages = await channelService.getChannelMessages(
      req.params.channelId,
      req.userId
    );
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

    const message = await channelService.sendChannelMessage(
      req.params.channelId,
      req.userId,
      content
    );

    res.status(201).json(formatResponse(true, message));
  } catch (error) {
    next(error);
  }
};

export const searchChannels = async (req, res, next) => {
  try {
    const { q } = req.query;
    const channels = await channelService.searchChannels(q);
    res.json(formatResponse(true, channels));
  } catch (error) {
    next(error);
  }
};

export const addAdmin = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.body;
    const channel = await channelService.addAdmin(
      req.params.channelId,
      req.userId,
      targetUserId
    );
    res.json(formatResponse(true, channel, 'Admin added'));
  } catch (error) {
    next(error);
  }
};

export const removeAdmin = async (req, res, next) => {
  try {
    const { userId: targetUserId } = req.body;
    const channel = await channelService.removeAdmin(
      req.params.channelId,
      req.userId,
      targetUserId
    );
    res.json(formatResponse(true, channel, 'Admin removed'));
  } catch (error) {
    next(error);
  }
};

export const updateChannel = async (req, res, next) => {
  try {
    const { name, username, description } = req.body;
    const channel = await channelService.updateChannel(
      req.params.channelId,
      req.userId,
      { name, username, description }
    );
    res.json(formatResponse(true, channel, 'Channel updated'));
  } catch (error) {
    next(error);
  }
};

const deleteAvatarFile = (avatarUrl) => {
  if (!avatarUrl || avatarUrl.startsWith('data:image')) return false;

  const fileName = path.basename(avatarUrl);
  const avatarPath = path.join(uploadsDir, 'avatars', fileName);
  
  if (fs.existsSync(avatarPath)) {
    fs.unlinkSync(avatarPath);
    return true;
  }
  return false;
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        formatResponse(false, null, 'No file uploaded')
      );
    }

    const channelId = req.params.channelId;
    const userId = req.userId;

    const channel = await channelService.getChannelById(channelId, userId);
    
    if (channel.ownerId !== userId) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json(
        formatResponse(false, null, 'Only the channel owner can change avatar')
      );
    }

    if (channel.avatar) {
      deleteAvatarFile(channel.avatar);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const updatedChannel = await channelService.updateChannelAvatar(
      channelId,
      avatarUrl
    );

    res.json(formatResponse(true, updatedChannel, 'Avatar uploaded successfully'));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const deleteAvatar = async (req, res, next) => {
  try {
    const channelId = req.params.channelId;
    const userId = req.userId;

    const channel = await channelService.getChannelById(channelId, userId);
    
    if (channel.ownerId !== userId) {
      return res.status(403).json(
        formatResponse(false, null, 'Only the channel owner can remove avatar')
      );
    }

    if (channel.avatar) {
      deleteAvatarFile(channel.avatar);
    }

    const updatedChannel = await channelService.updateChannelAvatar(
      channelId,
      null
    );

    res.json(formatResponse(true, updatedChannel, 'Avatar removed successfully'));
  } catch (error) {
    next(error);
  }
};