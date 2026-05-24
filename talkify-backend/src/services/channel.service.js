// src/services/channel.service.js

import { v4 as uuidv4 } from 'uuid';
import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';
import { CHANNEL_ROLES, MESSAGE_STATUS, MESSAGE_TYPE } from '../utils/constants.js';

export const createChannel = async (ownerId, { name, username, description, avatar }) => {
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    throw formatError('Username must be 3–30 characters and contain only letters, numbers, and underscores', 400);
  }

  const existingChannel = await db.getChannelByUsername(username);
  if (existingChannel) {
    throw formatError('This username is already taken by another channel', 400);
  }

  const existingUser = await db.getUserByUsername(username);
  if (existingUser) {
    throw formatError('This username is already taken by a user', 400);
  }

  const newChannel = {
    id: uuidv4(),
    name,
    username: username.toLowerCase(),
    description: description || '',
    avatar: avatar || null,
    ownerId,
    adminIds: [ownerId],
    memberIds: [ownerId],
    memberCount: 1,
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createChannel(newChannel);
  return newChannel;
};

export const getChannelById = async (channelId, userId) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  const owner = await db.getUserById(channel.ownerId);

  return {
    ...channel,
    owner: owner ? { id: owner.id, username: owner.username, avatar: owner.avatar } : null,
    isMember: channel.memberIds.includes(userId),
    isAdmin: channel.adminIds.includes(userId),
    isOwner: channel.ownerId === userId,
  };
};

export const getChannelByUsername = async (username, userId) => {
  const channel = await db.getChannelByUsername(username.toLowerCase());
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  return {
    ...channel,
    isMember: channel.memberIds.includes(userId),
    isAdmin: channel.adminIds.includes(userId),
    isOwner: channel.ownerId === userId,
  };
};

export const getUserChannels = async (userId) => {
  const channels = await db.getChannelsByUserId(userId);

  const populatedChannels = await Promise.all(
    channels.map(async (channel) => {
      const messages = await db.getMessagesByChannelId(channel.id);
      const lastMessage = messages[messages.length - 1] || null;

      return {
        ...channel,
        lastMessage,
        isMember: true,
        isAdmin: channel.adminIds.includes(userId),
        isOwner: channel.ownerId === userId,
      };
    })
  );

  return populatedChannels.sort((a, b) => {
    const dateA = a.lastMessage?.createdAt || a.createdAt;
    const dateB = b.lastMessage?.createdAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  });
};

export const joinChannel = async (channelId, userId) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (channel.memberIds.includes(userId)) {
    throw formatError('You are already a member of this channel', 400);
  }

  const updatedChannel = await db.updateChannel(channelId, {
    memberIds: [...channel.memberIds, userId],
    memberCount: channel.memberCount + 1,
    updatedAt: new Date().toISOString(),
  });

  return updatedChannel;
};

export const leaveChannel = async (channelId, userId) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (channel.ownerId === userId) {
    throw formatError('The channel owner cannot leave the channel', 400);
  }

  if (!channel.memberIds.includes(userId)) {
    throw formatError('You are not a member of this channel', 400);
  }

  const updatedChannel = await db.updateChannel(channelId, {
    memberIds: channel.memberIds.filter((id) => id !== userId),
    adminIds: channel.adminIds.filter((id) => id !== userId),
    memberCount: channel.memberCount - 1,
    updatedAt: new Date().toISOString(),
  });

  return updatedChannel;
};

export const addAdmin = async (channelId, userId, targetUserId) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (channel.ownerId !== userId) {
    throw formatError('Only the channel owner can add an admin', 403);
  }

  if (!channel.memberIds.includes(targetUserId)) {
    throw formatError('This user is not a member of the channel', 400);
  }

  if (channel.adminIds.includes(targetUserId)) {
    throw formatError('This user is already an admin', 400);
  }

  const updatedChannel = await db.updateChannel(channelId, {
    adminIds: [...channel.adminIds, targetUserId],
    updatedAt: new Date().toISOString(),
  });

  return updatedChannel;
};

export const removeAdmin = async (channelId, userId, targetUserId) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (channel.ownerId !== userId) {
    throw formatError('Only the channel owner can remove an admin', 403);
  }

  if (channel.ownerId === targetUserId) {
    throw formatError('The owner cannot be removed from the admin list', 400);
  }

  const updatedChannel = await db.updateChannel(channelId, {
    adminIds: channel.adminIds.filter((id) => id !== targetUserId),
    updatedAt: new Date().toISOString(),
  });

  return updatedChannel;
};

export const sendChannelMessage = async (channelId, senderId, content, type = MESSAGE_TYPE.TEXT) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (!channel.adminIds.includes(senderId)) {
    throw formatError('Only admins can send messages in this channel', 403);
  }

  const newMessage = {
    id: uuidv4(),
    channelId,
    senderId,
    content,
    type,
    status: MESSAGE_STATUS.SENT,
    createdAt: new Date().toISOString(),
  };

  await db.createMessage(newMessage);

  await db.updateChannel(channelId, {
    updatedAt: new Date().toISOString(),
  });

  return newMessage;
};

export const getChannelMessages = async (channelId, userId) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (!channel.memberIds.includes(userId)) {
    throw formatError('You are not a member of this channel', 403);
  }

  return await db.getMessagesByChannelId(channelId);
};

export const searchChannels = async (query) => {
  const channels = await db.getChannels();

  if (!query) {
    return channels.slice(0, 20);
  }

  const lowerQuery = query.toLowerCase();
  return channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(lowerQuery) ||
      channel.username.toLowerCase().includes(lowerQuery)
  );
};

export const updateChannel = async (channelId, userId, updates) => {
  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  if (channel.ownerId !== userId) {
    throw formatError('Only the channel owner can edit this information', 403);
  }

  if (updates.username && updates.username !== channel.username) {
    const existingChannel = await db.getChannelByUsername(updates.username);
    if (existingChannel && existingChannel.id !== channelId) {
      throw formatError('This username is already taken by another channel', 400);
    }
    
    const existingUser = await db.getUserByUsername(updates.username);
    if (existingUser) {
      throw formatError('This username is already taken by a user', 400);
    }
  }

  const updatedChannel = await db.updateChannel(channelId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  return updatedChannel;
};

export const updateChannelAvatar = async (channelId, avatarUrl) => {
  const updatedChannel = await db.updateChannel(channelId, {
    avatar: avatarUrl,
    updatedAt: new Date().toISOString(),
  });
  return updatedChannel;
};