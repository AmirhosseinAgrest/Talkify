// src/middleware/security.middleware.js

import rateLimit from 'express-rate-limit';
import { formatResponse } from '../utils/helpers.js';

const DEV_ORIGIN = 'http://localhost:5173';

// Allowed browser origins come from CLIENT_URL (comma-separated list supported).
// Development falls back to the Vite dev server; production must be explicit and
// never falls back to a wildcard or a guessed domain.
export const resolveAllowedOrigins = (clientUrl, nodeEnv) => {
  const origins = (clientUrl || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (origins.includes('*')) {
    throw new Error('CLIENT_URL must list explicit origins; "*" is not allowed');
  }

  if (origins.length === 0) {
    if (nodeEnv === 'production') {
      throw new Error('CLIENT_URL must be set in production (allowed frontend origin)');
    }
    return [DEV_ORIGIN];
  }

  const invalid = origins.filter((o) => {
    try {
      const url = new URL(o);
      return !['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search;
    } catch {
      return true;
    }
  });
  if (invalid.length > 0) {
    throw new Error(
      `CLIENT_URL entries must be origins like https://app.example.com (invalid: ${invalid.join(', ')})`
    );
  }

  return origins;
};

// Shared by Express and Socket.IO so both transports apply the same policy.
// Requests without an Origin header (curl, same-origin, server-to-server) pass
// through; browsers always send Origin on cross-origin requests.
export const isOriginAllowed = (allowedOrigins, origin) =>
  !origin || allowedOrigins.includes(origin);

export const createOriginChecker = (allowedOrigins) => (origin, callback) => {
  callback(null, isOriginAllowed(allowedOrigins, origin));
};

const rateLimitHandler = (req, res) => {
  res.status(429).json(formatResponse(false, null, 'Too many requests, please try again later'));
};

const baseLimiterOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitHandler,
  // Single-instance JSON-file deployment: the default in-memory store is appropriate.
  // It does not coordinate across multiple processes/instances.
};

// Credential endpoints (login/register): 10 attempts per 15 minutes per client IP.
export const authLimiter = rateLimit({
  ...baseLimiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

// Password change is authenticated but still guesses the current password:
// 5 attempts per 15 minutes per client IP.
export const passwordLimiter = rateLimit({
  ...baseLimiterOptions,
  windowMs: 15 * 60 * 1000,
  limit: 5,
});

// General API ceiling to blunt scripted abuse of search/lookup routes without
// affecting interactive use: 600 requests per minute per client IP.
export const apiLimiter = rateLimit({
  ...baseLimiterOptions,
  windowMs: 60 * 1000,
  limit: 600,
});
