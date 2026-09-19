// src/utils/helpers.js

export const formatResponse = (success, data, message = null) => {
  return {
    success,
    data,
    message,
  };
};

export const toPublicUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    isOnline: user.isOnline ?? false,
    lastSeen: user.lastSeen ?? null,
    isVerified: user.isVerified ?? false,
    isSystemAccount: user.isSystemAccount ?? false,
    createdAt: user.createdAt,
  };
};

export const formatError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
