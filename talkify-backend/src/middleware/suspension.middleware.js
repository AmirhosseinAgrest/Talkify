// src/middleware/suspension.middleware.js

import * as suspensionService from '../services/suspension.service.js';
import { formatResponse } from '../utils/helpers.js';

export const checkSuspension = async (req, res, next) => {
  try {
    const suspension = await suspensionService.checkSuspension(req.userId);

    if (suspension) {
      req.isSuspended = true;
      req.suspension = suspension;
    } else {
      req.isSuspended = false;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireNotSuspended = async (req, res, next) => {
  try {
    const suspension = await suspensionService.checkSuspension(req.userId);

    if (suspension) {
      const expiresAt = new Date(suspension.expiresAt);
      const remaining = Math.ceil((expiresAt - new Date()) / 1000);

      return res.status(403).json(
        formatResponse(
          false,
          {
            isSuspended: true,
            expiresAt: suspension.expiresAt,
            reason: suspension.reason,
            remaining,
            isPermanent: suspension.isPermanent,
          },
          'Your account has been suspended'
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
