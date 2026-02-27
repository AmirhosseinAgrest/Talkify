// src/controllers/auth.controller.js

import * as authService from '../services/auth.service.js';
import { formatResponse } from '../utils/helpers.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json(formatResponse(false, null, 'All fields are required'));
    }

    const result = await authService.register({ username, email, password });

    return res
      .status(201)
      .json(formatResponse(true, result, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(
          formatResponse(false, null, 'Email and password are required'),
        );
    }

    const ipHeader = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(ipHeader)
        ? ipHeader[0]
        : ipHeader?.split(',')[0]?.trim()) || req.ip || null;

    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.login({
      email,
      password,
      ip,
      userAgent,
    });

    console.log('✅ Login successful for:', email);

    return res.json(formatResponse(true, result, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.userId);

    return res.json(formatResponse(true, null, 'Logout successful'));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.userId);

    return res.json(formatResponse(true, user));
  } catch (error) {
    next(error);
  }
};
