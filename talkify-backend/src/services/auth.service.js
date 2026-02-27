// src/services/auth.service.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import * as db from './db.service.js';
import { formatError } from '../utils/helpers.js';
import { SYSTEM_ROLES } from '../utils/constants.js';
import * as systemService from './system.service.js';

const hashIp = (ip) => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const detectCountryFromIp = async (ip) => {
  if (!ip) return 'UNKNOWN';

  try {
    const response = await fetch(`https://ipapi.co/${ip}/country/`);
    const country = await response.text();

    if (!country || country.length !== 2) {
      return 'UNKNOWN';
    }

    return country.toUpperCase();
  } catch (error) {
    console.error('GeoIP lookup failed:', error);
    return 'UNKNOWN';
  }
};

const parseDeviceFromUserAgent = (userAgent) => {
  const ua = (userAgent || '').toLowerCase();

  let os = 'Unknown OS';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ios')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';

  let browser = 'Unknown Browser';
  if (ua.includes('chrome') && !ua.includes('edge') && !ua.includes('opr'))
    browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';

  return `${browser} on ${os}`;
};

const generateToken = (userId, sessionId) => {
  const payload = { userId };
  if (sessionId) payload.sessionId = sessionId;

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const register = async ({ username, email, password }) => {
  const existingEmail = await db.getUserByEmail(email);
  if (existingEmail) {
    throw formatError('This email is already registered', 400);
  }

  const existingUsername = await db.getUserByUsername(username);
  if (existingUsername) {
    throw formatError('This username is already taken', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();

  const newUser = {
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    avatar: null,
    bio: null,
    phone: null,
    isOnline: true,
    lastSeen: now,
    isVerified: false,
    isSystemAccount: false,
    role: SYSTEM_ROLES.USER,
    country: null,
    createdAt: now,
    loginLogs: [],
    sessions: [],
  };

  await db.createUser(newUser);

  try {
    await systemService.sendWelcomeMessage(newUser.id, newUser.username);
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }

  const token = generateToken(newUser.id);
  const { password: _, ...userWithoutPassword } = newUser;

  return { user: userWithoutPassword, token };
};

export const login = async ({ email, password, ip, userAgent }) => {
  const user = await db.getUserByEmail(email);
  if (!user) {
    throw formatError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw formatError('Invalid email or password', 401);
  }

  const now = new Date().toISOString();

  const country = await detectCountryFromIp(ip);
  const device = parseDeviceFromUserAgent(userAgent);
  const ipHash = hashIp(ip);

  const loginLog = {
    id: uuidv4(),
    country,
    device,
    ipHash,
    createdAt: now,
  };

  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    device,
    country,
    ipHash,
    isActive: true,
    createdAt: now,
    lastActiveAt: now,
  };

  const updatedUser = {
    ...user,
    isOnline: true,
    lastSeen: now,
    country:
      user.country ||
      (country && country !== 'UNKNOWN' ? country : user.country || null),
    loginLogs: [...(user.loginLogs || []), loginLog],
    sessions: [...(user.sessions || []), session],
  };

  await db.updateUser(user.id, updatedUser);

  const token = generateToken(user.id, sessionId);
  const { password: _, ...userWithoutPassword } = updatedUser;

  return {
    user: {
      ...userWithoutPassword,
      isOnline: true,
    },
    token,
  };
};

export const logout = async (userId) => {
  const now = new Date().toISOString();

  const user = await db.getUserById(userId);
  if (!user) return;

  const updatedUser = {
    ...user,
    isOnline: false,
    lastSeen: now,
    sessions: (user.sessions || []).map((s) => ({
      ...s,
      isActive: false,
      lastActiveAt: now,
    })),
  };

  await db.updateUser(userId, updatedUser);
};

export const getProfile = async (userId) => {
  const user = await db.getUserById(userId);
  if (!user) {
    throw formatError('User not found', 404);
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw formatError('Invalid token', 401);
  }
};
