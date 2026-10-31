import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode;
  let code = err.code;
  let message = err.message;
  let details = err.details || [];

  // Handle Mongoose / MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    message = `A resource with this ${field} already exists.`;
    details = [{ field, value: err.keyValue?.[field] }];
  }
  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid format for identifier: ${err.value}`;
    details = [{ field: err.path, value: err.value }];
  }
  // Handle Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed on database schema';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle Zod Validation Error
  else if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = (err.issues || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  }
  // Handle Bad JSON syntax in body
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Malformed JSON payload in request body';
    details = [];
  }

  // Fallback defaults
  statusCode = statusCode || 500;
  code = code || 'INTERNAL_SERVER_ERROR';
  message = message || 'An unexpected error occurred';

  // Only log unexpected 500 errors
  if (statusCode >= 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Mask internal server errors in production
  if (statusCode === 500 && env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
};

export default errorHandler;
