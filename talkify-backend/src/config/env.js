// src/config/env.js
//
// Single source of truth for backend runtime configuration. Loaded once at startup;
// exits the process with a variable-specific message when configuration is unusable.
// Secret values are never printed.

import dotenv from 'dotenv';
import { resolveAllowedOrigins } from '../middleware/security.middleware.js';

dotenv.config();

const NODE_ENVS = ['development', 'production', 'test'];
const PLACEHOLDER_SECRETS = ['your_jwt_secret_key_here', 'changeme', 'secret'];

// Accepted TRUST_PROXY values (see .env.example):
//   unset / "false" / "0"  -> proxies are not trusted (direct connections)
//   "1", "2", ...          -> number of reverse-proxy hops in front of the app
//   "loopback" | "linklocal" | "uniquelocal" or comma-separated IPs/CIDRs
// "true" is deliberately rejected: it trusts X-Forwarded-For from anyone.
const parseTrustProxy = (raw, errors) => {
  const value = (raw || '').trim();
  if (!value || value === 'false' || value === '0') return false;

  if (value === 'true' || value === '*') {
    errors.push(
      'TRUST_PROXY must not be "true"/"*" (would trust forwarded headers from any client); use a hop count such as "1"'
    );
    return false;
  }

  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);

  const entries = value.split(',').map((e) => e.trim());
  const named = ['loopback', 'linklocal', 'uniquelocal'];
  const ipOrCidr = /^[0-9a-fA-F.:]+(\/\d{1,3})?$/;
  if (entries.every((e) => named.includes(e) || ipOrCidr.test(e))) return entries.join(',');

  errors.push(
    'TRUST_PROXY must be a hop count, "loopback"/"linklocal"/"uniquelocal", or a comma-separated list of IPs/CIDRs'
  );
  return false;
};

const load = () => {
  const errors = [];
  const env = process.env;

  const nodeEnv = (env.NODE_ENV || 'development').trim();
  if (!NODE_ENVS.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of ${NODE_ENVS.join(', ')} (got "${nodeEnv}")`);
  }
  const isProduction = nodeEnv === 'production';

  const portRaw = (env.PORT || '3001').trim();
  const port = Number(portRaw);
  if (!/^\d+$/.test(portRaw) || port < 1 || port > 65535) {
    errors.push(`PORT must be an integer between 1 and 65535 (got "${portRaw}")`);
  }

  const jwtSecret = env.JWT_SECRET || '';
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required (HMAC key used to sign session tokens)');
  } else if (isProduction) {
    if (PLACEHOLDER_SECRETS.includes(jwtSecret.toLowerCase())) {
      errors.push('JWT_SECRET is set to a placeholder value; generate a strong random secret');
    } else if (jwtSecret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
  }

  const jwtExpiresIn = (env.JWT_EXPIRES_IN || '7d').trim();
  if (!/^\d+$/.test(jwtExpiresIn) && !/^\d+\s*[smhdwy]$/i.test(jwtExpiresIn)) {
    errors.push(
      `JWT_EXPIRES_IN must be seconds or a duration like "7d", "12h" (got "${jwtExpiresIn}")`
    );
  }

  let allowedOrigins = [];
  try {
    allowedOrigins = resolveAllowedOrigins(env.CLIENT_URL, nodeEnv);
  } catch (error) {
    errors.push(error.message);
  }

  const trustProxy = parseTrustProxy(env.TRUST_PROXY, errors);

  if (errors.length > 0) {
    console.error('Invalid backend configuration:');
    for (const message of errors) console.error(`  - ${message}`);
    console.error('See talkify-backend/.env.example for the expected variables.');
    process.exit(1);
  }

  return Object.freeze({
    nodeEnv,
    isProduction,
    port,
    jwtSecret,
    jwtExpiresIn,
    allowedOrigins,
    trustProxy,
  });
};

export const config = load();
