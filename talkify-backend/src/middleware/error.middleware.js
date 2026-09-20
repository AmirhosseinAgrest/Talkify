// src/middleware/error.middleware.js

import { formatResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);

  if (err.type === 'entity.too.large') {
    return res.status(413).json(formatResponse(false, null, 'Request body too large'));
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(formatResponse(false, null, 'Malformed request body'));
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server error';

  res.status(statusCode).json(formatResponse(false, null, message));
};

export const notFoundHandler = (req, res) => {
  res.status(404).json(formatResponse(false, null, 'Route not found'));
};
