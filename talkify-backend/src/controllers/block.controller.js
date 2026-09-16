// src/controllers/block.controller.js

import * as blockService from '../services/block.service.js';
import { formatResponse } from '../utils/helpers.js';

export const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(formatResponse(false, null, 'User ID is required'));
    }

    const block = await blockService.blockUser(req.userId, userId);
    res.status(201).json(formatResponse(true, block, 'User blocked'));
  } catch (error) {
    next(error);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    await blockService.unblockUser(req.userId, userId);
    res.json(formatResponse(true, null, 'User unblocked'));
  } catch (error) {
    next(error);
  }
};

export const getBlockedUsers = async (req, res, next) => {
  try {
    const users = await blockService.getBlockedUsers(req.userId);
    res.json(formatResponse(true, users));
  } catch (error) {
    next(error);
  }
};

export const checkBlockStatus = async (req, res, next) => {
  try {
    const status = await blockService.checkBlockStatus(req.userId, req.params.userId);
    res.json(formatResponse(true, status));
  } catch (error) {
    next(error);
  }
};
