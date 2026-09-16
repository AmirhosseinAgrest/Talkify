// src/services/admin.service.js

import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';
import { SYSTEM_ROLES } from '../utils/constants.js';

export const isAdmin = async (userId) => {
  const user = await db.getUserById(userId);
  return user && (user.role === SYSTEM_ROLES.ADMIN || user.role === SYSTEM_ROLES.SUPER_ADMIN);
};

export const isSuperAdmin = async (userId) => {
  const user = await db.getUserById(userId);
  return user && user.role === SYSTEM_ROLES.SUPER_ADMIN;
};

export const getAllUsers = async () => {
  const users = await db.getUsers();
  return users.map(({ password: _, ...user }) => user);
};

export const getAllChannels = async () => {
  return await db.getChannels();
};

export const verifyUser = async (adminId, targetUserId) => {
  const admin = await db.getUserById(adminId);
  if (!admin || (admin.role !== SYSTEM_ROLES.ADMIN && admin.role !== SYSTEM_ROLES.SUPER_ADMIN)) {
    throw formatError('You do not have admin access', 403);
  }

  const targetUser = await db.getUserById(targetUserId);
  if (!targetUser) {
    throw formatError('User not found', 404);
  }

  const updatedUser = await db.updateUser(targetUserId, {
    isVerified: true,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminId,
  });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const unverifyUser = async (adminId, targetUserId) => {
  const admin = await db.getUserById(adminId);
  if (!admin || (admin.role !== SYSTEM_ROLES.ADMIN && admin.role !== SYSTEM_ROLES.SUPER_ADMIN)) {
    throw formatError('You do not have admin access', 403);
  }

  const updatedUser = await db.updateUser(targetUserId, {
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
  });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const verifyChannel = async (adminId, channelId) => {
  const admin = await db.getUserById(adminId);
  if (!admin || (admin.role !== SYSTEM_ROLES.ADMIN && admin.role !== SYSTEM_ROLES.SUPER_ADMIN)) {
    throw formatError('You do not have admin access', 403);
  }

  const channel = await db.getChannelById(channelId);
  if (!channel) {
    throw formatError('Channel not found', 404);
  }

  const updatedChannel = await db.updateChannel(channelId, {
    isVerified: true,
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminId,
  });

  return updatedChannel;
};

export const unverifyChannel = async (adminId, channelId) => {
  const admin = await db.getUserById(adminId);
  if (!admin || (admin.role !== SYSTEM_ROLES.ADMIN && admin.role !== SYSTEM_ROLES.SUPER_ADMIN)) {
    throw formatError('You do not have admin access', 403);
  }

  const updatedChannel = await db.updateChannel(channelId, {
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
  });

  return updatedChannel;
};

export const addSystemAdmin = async (superAdminId, targetUserId) => {
  const superAdmin = await db.getUserById(superAdminId);
  if (!superAdmin || superAdmin.role !== SYSTEM_ROLES.SUPER_ADMIN) {
    throw formatError('Only the super admin can add an admin', 403);
  }

  const updatedUser = await db.updateUser(targetUserId, {
    role: SYSTEM_ROLES.ADMIN,
  });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const removeSystemAdmin = async (superAdminId, targetUserId) => {
  const superAdmin = await db.getUserById(superAdminId);
  if (!superAdmin || superAdmin.role !== SYSTEM_ROLES.SUPER_ADMIN) {
    throw formatError('Only the super admin can add an admin', 403);
  }

  const updatedUser = await db.updateUser(targetUserId, {
    role: SYSTEM_ROLES.USER,
  });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const getDashboardStats = async () => {
  const users = await db.getUsers();
  const channels = await db.getChannels();
  const messages = await db.getMessages();
  const chats = await db.getChats();

  return {
    totalUsers: users.length,
    verifiedUsers: users.filter((u) => u.isVerified).length,
    onlineUsers: users.filter((u) => u.isOnline).length,
    totalChannels: channels.length,
    verifiedChannels: channels.filter((c) => c.isVerified).length,
    totalMessages: messages.length,
    totalChats: chats.length,
  };
};
