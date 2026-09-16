// src/middleware/auth.middleware.js

import { verifyToken } from '../services/auth.service.js';
import { formatResponse } from '../utils/helpers.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(formatResponse(false, null, 'Token not provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json(formatResponse(false, null, 'Invalid token'));
  }
};
