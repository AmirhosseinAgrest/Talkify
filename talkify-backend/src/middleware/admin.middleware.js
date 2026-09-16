// src/middleware/admin.middleware.js

import * as adminService from '../services/admin.service.js';
import { formatResponse } from '../utils/helpers.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const isAdmin = await adminService.isAdmin(req.userId);
    if (!isAdmin) {
      return res.status(403).json(formatResponse(false, null, 'Access restricted to admins only'));
    }
    next();
  } catch {
    return res.status(500).json(formatResponse(false, null, 'Server error'));
  }
};

export const requireSuperAdmin = async (req, res, next) => {
  try {
    const isSuperAdmin = await adminService.isSuperAdmin(req.userId);
    if (!isSuperAdmin) {
      return res
        .status(403)
        .json(formatResponse(false, null, 'Access restricted to super admins only'));
    }
    next();
  } catch {
    return res.status(500).json(formatResponse(false, null, 'Server error'));
  }
};
