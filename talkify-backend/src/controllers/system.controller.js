// src/controllers/system.controller.js

import * as systemService from '../services/system.service.js';
import * as db from '../services/db.service.js';
import { formatResponse } from '../utils/helpers.js';

export const sendBroadcast = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json(formatResponse(false, null, 'Message content is required'));
    }

    const result = await systemService.sendBroadcastMessage(content, req.userId);

    res.json(formatResponse(true, result, `Message sent to ${result.sent} users`));
  } catch (error) {
    next(error);
  }
};

export const sendManualMessage = async (req, res, next) => {
  try {
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res
        .status(400)
        .json(formatResponse(false, null, 'User and message content are required'));
    }

    const result = await systemService.sendManualMessage(userId, content);

    res.json(formatResponse(true, result, 'Message sent'));
  } catch (error) {
    next(error);
  }
};

export const getBroadcastHistory = async (req, res, next) => {
  try {
    const broadcasts = await db.getBroadcasts();
    res.json(formatResponse(true, broadcasts));
  } catch (error) {
    next(error);
  }
};

export const getSystemAccount = async (req, res, next) => {
  try {
    const account = await systemService.getSystemAccount();
    if (!account) {
      return res.status(404).json(formatResponse(false, null, 'System account not found'));
    }

    const { password: _, ...safeAccount } = account;
    res.json(formatResponse(true, safeAccount));
  } catch (error) {
    next(error);
  }
};
