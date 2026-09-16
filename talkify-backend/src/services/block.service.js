// src/services/block.service.js

import { v4 as uuidv4 } from 'uuid';
import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';
import * as systemService from './system.service.js';

export const blockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) {
    throw formatError('You cannot block yourself', 400);
  }

  const blockedUser = await db.getUserById(blockedId);
  if (!blockedUser) {
    throw formatError('User not found', 404);
  }

  const isAlreadyBlocked = await db.isBlocked(blockerId, blockedId);
  if (isAlreadyBlocked) {
    throw formatError('This user is already blocked', 400);
  }

  const blockData = {
    id: uuidv4(),
    blockerId,
    blockedId,
    createdAt: new Date().toISOString(),
  };

  await db.createBlock(blockData);

  try {
    const blocker = await db.getUserById(blockerId);
    await systemService.sendBlockNotification(blockedId, blocker.username);
  } catch (error) {
    console.error('Failed to send block notification:', error);
  }

  await db.createBlock(blockData);
  return blockData;
};

export const unblockUser = async (blockerId, blockedId) => {
  const isBlocked = await db.isBlocked(blockerId, blockedId);
  if (!isBlocked) {
    throw formatError('This user is not blocked', 400);
  }

  await db.removeBlock(blockerId, blockedId);
};

export const getBlockedUsers = async (userId) => {
  const blocks = await db.getBlocksByUserId(userId);

  const blockedUsers = await Promise.all(
    blocks.map(async (block) => {
      const user = await db.getUserById(block.blockedId);
      if (user) {
        const { password: _, ...safeUser } = user;
        return {
          ...safeUser,
          blockedAt: block.createdAt,
        };
      }
      return null;
    })
  );

  return blockedUsers.filter(Boolean);
};

export const checkBlockStatus = async (userId1, userId2) => {
  const block1 = await db.isBlocked(userId1, userId2);
  const block2 = await db.isBlocked(userId2, userId1);

  return {
    blockedByMe: block1,
    blockedMe: block2,
    isBlocked: block1 || block2,
  };
};
