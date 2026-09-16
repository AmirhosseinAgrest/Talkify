// src/controllers/admin.controller.js

import * as adminService from '../services/admin.service.js';
import { formatResponse } from '../utils/helpers.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(formatResponse(true, stats));
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.json(formatResponse(true, users));
  } catch (error) {
    next(error);
  }
};

export const getAllChannels = async (req, res, next) => {
  try {
    const channels = await adminService.getAllChannels();
    res.json(formatResponse(true, channels));
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await adminService.verifyUser(req.userId, req.params.userId);
    res.json(formatResponse(true, user, 'User verified'));
  } catch (error) {
    next(error);
  }
};

export const unverifyUser = async (req, res, next) => {
  try {
    const user = await adminService.unverifyUser(req.userId, req.params.userId);
    res.json(formatResponse(true, user, 'User verification revoked'));
  } catch (error) {
    next(error);
  }
};

export const verifyChannel = async (req, res, next) => {
  try {
    const channel = await adminService.verifyChannel(req.userId, req.params.channelId);
    res.json(formatResponse(true, channel, 'Channel verified'));
  } catch (error) {
    next(error);
  }
};

export const unverifyChannel = async (req, res, next) => {
  try {
    const channel = await adminService.unverifyChannel(req.userId, req.params.channelId);
    res.json(formatResponse(true, channel, 'Channel verification revoked'));
  } catch (error) {
    next(error);
  }
};

export const addSystemAdmin = async (req, res, next) => {
  try {
    const user = await adminService.addSystemAdmin(req.userId, req.params.userId);
    res.json(formatResponse(true, user, 'System admin added'));
  } catch (error) {
    next(error);
  }
};

export const removeSystemAdmin = async (req, res, next) => {
  try {
    const user = await adminService.removeSystemAdmin(req.userId, req.params.userId);
    res.json(formatResponse(true, user, 'System admin removed'));
  } catch (error) {
    next(error);
  }
};
