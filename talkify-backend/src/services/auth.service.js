// src/services/auth.service.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

import * as db from './db.service.js';
import { config } from '../config/env.js';
import { formatError } from '../utils/helpers.js';
import { SYSTEM_ROLES } from '../utils/constants.js';
import * as systemService from './system.service.js';

const hashIp = (ip) => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const GEOIP_TIMEOUT_MS = 2000;

const detectCountryFromIp = async (ip) => {
  if (!ip) return 'UNKNOWN';

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country/`, {
      signal: AbortSignal.timeout(GEOIP_TIMEOUT_MS),
    });

    if (!response.ok) {
      return 'UNKNOWN';
    }

    const country = (await response.text()).trim();

    if (!/^[A-Za-z]{2}$/.test(country)) {
      return 'UNKNOWN';
    }

    return country.toUpperCase();
  } catch (error) {
    const reason = error?.name === 'TimeoutError' ? 'timeout' : error?.name || 'error';
    console.warn(`GeoIP lookup skipped (${reason})`);
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
  if (ua.includes('chrome') && !ua.includes('edge') && !ua.includes('opr')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';

  return `${browser} on ${os}`;
};

const generateToken = (userId, sessionId) => {
  const payload = { userId, sessionId };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  const { exp } = jwt.decode(token);
  const expiresAt = exp ? new Date(exp * 1000).toISOString() : null;

  return { token, expiresAt };
};

const createSession = ({ sessionId, device, country, ipHash, now, expiresAt }) => ({
  id: sessionId,
  device,
  country,
  ipHash,
  isActive: true,
  createdAt: now,
  lastActiveAt: now,
  expiresAt,
});

const pruneExpiredSessions = (sessions, now) =>
  (sessions || []).filter((s) => !s.expiresAt || new Date(s.expiresAt) > new Date(now));

export const register = async ({ username, email, password }) => {
  const existingEmail = await db.getUserByEmail(email);
  if (existingEmail) {
    throw formatError('This email is already registered', 400);
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    throw formatError(
      'Username must be 3–30 characters and contain only letters, numbers, and underscores',
      400
    );
  }

  const existingUser = await db.getUserByUsername(username);
  if (existingUser) {
    throw formatError('This username is already taken by a user', 400);
  }

  const existingChannel = await db.getChannelByUsername(username);
  if (existingChannel) {
    throw formatError('This username is already taken by a channel', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();

  const newUser = {
    id: uuidv4(),
    username: username.toLowerCase(),
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

  const sessionId = uuidv4();
  const { token, expiresAt } = generateToken(newUser.id, sessionId);
  newUser.sessions.push(
    createSession({
      sessionId,
      device: 'Unknown Browser on Unknown OS',
      country: 'UNKNOWN',
      ipHash: null,
      now,
      expiresAt,
    })
  );

  await db.createUser(newUser);

  try {
    await systemService.sendWelcomeMessage(newUser.id, newUser.username);
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }

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
  const { token, expiresAt } = generateToken(user.id, sessionId);
  const session = createSession({ sessionId, device, country, ipHash, now, expiresAt });

  const updatedUser = {
    ...user,
    isOnline: true,
    lastSeen: now,
    country: user.country || (country && country !== 'UNKNOWN' ? country : user.country || null),
    loginLogs: [...(user.loginLogs || []), loginLog],
    sessions: [...pruneExpiredSessions(user.sessions, now), session],
  };

  await db.updateUser(user.id, updatedUser);

  const { password: _, ...userWithoutPassword } = updatedUser;

  return {
    user: {
      ...userWithoutPassword,
      isOnline: true,
    },
    token,
  };
};

export const logout = async (userId, sessionId) => {
  const now = new Date().toISOString();

  const user = await db.getUserById(userId);
  if (!user) return;

  const sessions = pruneExpiredSessions(user.sessions, now).map((s) =>
    s.id === sessionId ? { ...s, isActive: false, lastActiveAt: now } : s
  );

  await db.updateUser(userId, {
    isOnline: false,
    lastSeen: now,
    sessions,
  });
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
    return jwt.verify(token, config.jwtSecret);
  } catch {
    throw formatError('Invalid token', 401);
  }
};

export const authenticateToken = async (token) => {
  const decoded = verifyToken(token);
  const { userId, sessionId } = decoded;

  if (!userId || !sessionId) {
    throw formatError('Invalid token', 401);
  }

  const user = await db.getUserById(userId);
  const session = user && (user.sessions || []).find((s) => s.id === sessionId);

  if (!session || !session.isActive) {
    throw formatError('Invalid token', 401);
  }

  return { userId, sessionId };
};
