import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';
import { HTTP_STATUS } from '../constants/status.constants.js';


export const notFoundHandler = (req, res, next) => {
  const err = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Resource not found: Cannot ${req.method} ${req.originalUrl}`
  );
  next(err);
};


export const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. If error is not an instance of our custom ApiError, convert standard/external errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'An unexpected internal server error occurred';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // 2. Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier: '${err.value}' for field '${err.path}'`;
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, message, [{ field: err.path, value: err.value, issue: 'Invalid ObjectId format' }]);
  }

  // 3. Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    error = new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Validation error occurred', messages);
  }

  // 4. Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {});
    const message = `Duplicate value entered for field(s): ${duplicateFields.join(', ')}. Value must be unique.`;
    error = new ApiError(HTTP_STATUS.CONFLICT, message, duplicateFields);
  }

  // 5. Handle Malformed JSON payload syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, 'Malformed JSON payload syntax');
  }

  // Log error details for diagnostics
  if (error.statusCode >= 500) {
    logger.error(`[SYSTEM CRITICAL] ${error.message}`, {
      path: req.originalUrl,
      method: req.method,
      stack: error.stack
    });
  } else {
    logger.warn(`[CLIENT ERROR ${error.statusCode}] ${error.message} - ${req.method} ${req.originalUrl}`);
  }

  // Standard Phase 2 response format: { success, message, error }
  const responsePayload = {
    success: false,
    message: error.message,
    error: {
      statusCode: error.statusCode,
      details: error.errors && (Array.isArray(error.errors) ? error.errors.length > 0 : Object.keys(error.errors).length > 0) ? error.errors : undefined,
      ...(config.isDevelopment && { stack: error.stack })
    }
  };

  res.status(error.statusCode).json(responsePayload);
};

export default {
  notFoundHandler,
  errorHandler
};
