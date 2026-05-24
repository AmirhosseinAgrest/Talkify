// src/controllers/user.controller.js

import * as db from '../services/db.service.js';
import { formatResponse } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const users = await db.getUsers();

    let filteredUsers = users.filter((user) => user.id !== req.userId);

    if (q) {
      const query = q.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    const safeUsers = filteredUsers.map(({ password, ...user }) => user);
    res.json(formatResponse(true, safeUsers));
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await db.getUserById(req.params.userId);

    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    const { password, ...safeUser } = user;
    res.json(formatResponse(true, safeUser));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, phone } = req.body;
    const userId = req.userId;

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    if (username && username !== user.username) {
      const existingUser = await db.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json(
          formatResponse(false, null, 'This username is already taken')
        );
      }
      
      const existingChannel = await db.getChannelByUsername(username);
      if (existingChannel) {
        return res.status(400).json(
          formatResponse(false, null, 'This username is already taken by a channel')
        );
      }
    }

    const updatedUser = await db.updateUser(userId, {
      username: username || user.username,
      bio: bio !== undefined ? bio : user.bio,
      phone: phone !== undefined ? phone : user.phone,
      updatedAt: new Date().toISOString(),
    });

    const { password, ...safeUser } = updatedUser;
    res.json(formatResponse(true, safeUser, 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    const userId = req.userId;

    if (!file) {
      return res.status(400).json(formatResponse(false, null, 'No file selected'));
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    const updatedUser = await db.updateUser(userId, {
      avatar: avatarUrl,
      updatedAt: new Date().toISOString(),
    });

    const { password, ...safeUser } = updatedUser;
    res.json(formatResponse(true, safeUser, 'Avatar updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteAvatar = async (req, res, next) => {
  try {
    const userId = req.userId;

    const updatedUser = await db.updateUser(userId, {
      avatar: null,
      updatedAt: new Date().toISOString(),
    });

    const { password, ...safeUser } = updatedUser;
    res.json(formatResponse(true, safeUser, 'Avatar removed'));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        formatResponse(false, null, 'Current and new password are required')
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        formatResponse(false, null, 'New password must be at least 6 characters long')
      );
    }

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json(formatResponse(false, null, 'Current password is incorrect'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.updateUser(userId, {
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    });

    res.json(formatResponse(true, null, 'Password changed'));
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const user = await db.getUserById(req.userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    const settings = user.settings || {
      theme: 'system',
      language: 'fa',
      notifications: true,
      soundEnabled: true,
      showOnlineStatus: true,
      showLastSeen: true,
      showReadReceipts: true,
    };

    res.json(formatResponse(true, settings));
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    const userId = req.userId;

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    const currentSettings = user.settings || {};
    const newSettings = { ...currentSettings, ...settings };

    await db.updateUser(userId, {
      settings: newSettings,
      updatedAt: new Date().toISOString(),
    });

    res.json(formatResponse(true, newSettings, 'Settings saved'));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    if (!password) {
      return res.status(400).json(formatResponse(false, null, 'Password is required'));
    }

    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false, null, 'User not found'));
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json(formatResponse(false, null, 'Incorrect password'));
    }

    await db.updateUser(userId, {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      email: `deleted_${userId}@deleted.com`,
      username: `deleted_${userId}`,
    });

    res.json(formatResponse(true, null, 'Account deleted'));
  } catch (error) {
    next(error);
  }
};