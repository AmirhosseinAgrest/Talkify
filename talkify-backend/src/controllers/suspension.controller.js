// src/controllers/suspension.controller.js

import * as suspensionService from '../services/suspension.service.js';
import { formatResponse } from '../utils/helpers.js';

export const suspendUser = async (req, res, next) => {
  try {
    const { userId, duration, reason } = req.body;

    if (!userId || !duration) {
      return res.status(400).json(formatResponse(false, null, 'User and duration are required'));
    }

    const suspension = await suspensionService.suspendUser(req.userId, userId, duration, reason);

    res.status(201).json(formatResponse(true, suspension, 'User has been suspended'));
  } catch (error) {
    next(error);
  }
};

export const unsuspendUser = async (req, res, next) => {
  try {
    const result = await suspensionService.unsuspendUser(req.userId, req.params.suspensionId);
    res.json(formatResponse(true, result, 'Suspension lifted'));
  } catch (error) {
    next(error);
  }
};

export const getActiveSuspensions = async (req, res, next) => {
  try {
    const suspensions = await suspensionService.getActiveSuspensions();
    res.json(formatResponse(true, suspensions));
  } catch (error) {
    next(error);
  }
};

export const getAllSuspensions = async (req, res, next) => {
  try {
    const suspensions = await suspensionService.getAllSuspensions();
    res.json(formatResponse(true, suspensions));
  } catch (error) {
    next(error);
  }
};

export const checkSuspension = async (req, res, next) => {
  try {
    const suspension = await suspensionService.checkSuspension(req.userId);
    res.json(formatResponse(true, suspension));
  } catch (error) {
    next(error);
  }
};
