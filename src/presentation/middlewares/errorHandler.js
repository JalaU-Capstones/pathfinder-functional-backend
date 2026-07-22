const logger = require('../../utils/logger');
const { ERROR_STATUS_MAP, ERROR_TYPES } = require('../../utils/errors');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let code = ERROR_TYPES.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  if (err.isAppError) {
    code = err.type;
    statusCode = ERROR_STATUS_MAP[code] || 500;
    message = err.message;
  }

  // Log based on status code severity
  if (statusCode >= 500) {
    logger.error(`${code}: ${message} - ${err.stack || ''}`);
  } else if (statusCode >= 400) {
    logger.warn(`${code}: ${message}`);
  }

  const errorResponse = {
    code,
    message
  };

  if (stack) {
    errorResponse.stack = stack;
  }

  res.status(statusCode).json({
    success: false,
    error: errorResponse
  });
};

module.exports = { errorHandler };
