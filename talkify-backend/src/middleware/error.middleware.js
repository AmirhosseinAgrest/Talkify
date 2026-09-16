// src/middleware/error.middleware.js

import { formatResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';

  res.status(statusCode).json(formatResponse(false, null, message));
};

export const notFoundHandler = (req, res) => {
  res.status(404).json(formatResponse(false, null, 'Route not found'));
};
