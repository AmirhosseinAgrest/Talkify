// src/utils/helpers.js

export const formatResponse = (success, data, message = null) => {
  return {
    success,
    data,
    message,
  };
};

export const formatError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
