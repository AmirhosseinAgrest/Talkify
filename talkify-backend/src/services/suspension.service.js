// src/services/suspension.service.js

import { v4 as uuidv4 } from 'uuid';
import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';
import * as systemService from './system.service.js';

export const suspendUser = async (adminId, userId, duration, reason) => {
  const user = await db.getUserById(userId);
  if (!user) {
    throw formatError('User not found', 404);
  }

  const activeSuspension = await db.getActiveSuspension(userId);
  if (activeSuspension) {
    throw formatError('This user is currently suspended', 400);
  }

  const admin = await db.getUserById(adminId);

  let expiresAt;
  if (duration === 'permanent') {
    expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
  } else {
    expiresAt = new Date(Date.now() + duration * 1000).toISOString();
  }

  const suspension = {
    id: uuidv4(),
    userId,
    username: user.username,
    adminId,
    adminUsername: admin.username,
    reason: reason || 'No reason provided',
    duration,
    expiresAt,
    isActive: true,
    isPermanent: duration === 'permanent',
    createdAt: new Date().toISOString(),
    liftedAt: null,
    liftedBy: null,
  };

  await db.createSuspension(suspension);

  await db.updateUser(userId, {
    isSuspended: true,
    suspendedUntil: expiresAt,
  });

  try {
    await systemService.sendSuspensionNotification(
      userId,
      reason,
      expiresAt,
      duration === 'permanent'
    );
  } catch (error) {
    console.error('Failed to send suspension notification:', error);
  }

  return suspension;
};

export const unsuspendUser = async (adminId, suspensionId) => {
  const suspensions = await db.getSuspensions();
  const suspension = suspensions.find((s) => s.id === suspensionId);

  if (!suspension) {
    throw formatError('Suspension not found', 404);
  }

  const admin = await db.getUserById(adminId);

  await db.updateSuspension(suspensionId, {
    isActive: false,
    liftedAt: new Date().toISOString(),
    liftedBy: adminId,
    liftedByUsername: admin.username,
  });

  await db.updateUser(suspension.userId, {
    isSuspended: false,
    suspendedUntil: null,
  });

  return { message: 'Suspension lifted' };
};

export const getActiveSuspensions = async () => {
  const suspensions = await db.getSuspensions();
  const now = new Date();

  return suspensions.filter((s) => s.isActive && new Date(s.expiresAt) > now);
};

export const getAllSuspensions = async () => {
  return await db.getSuspensions();
};

export const checkSuspension = async (userId) => {
  const suspension = await db.getActiveSuspension(userId);

  if (suspension) {
    const now = new Date();
    const expiresAt = new Date(suspension.expiresAt);

    if (expiresAt <= now) {
      await db.updateSuspension(suspension.id, { isActive: false });
      await db.updateUser(userId, {
        isSuspended: false,
        suspendedUntil: null,
      });
      return null;
    }

    return suspension;
  }

  return null;
};
