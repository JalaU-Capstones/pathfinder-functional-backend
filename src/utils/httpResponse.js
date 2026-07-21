const { ERROR_TYPES } = require('./errors');

const sendSuccess = (res, statusCode = 200, data = null) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

const sendError = (res, error) => {
  if (error.isAppError) {
    let statusCode;
    
    switch (error.type) {
    case ERROR_TYPES.NOT_FOUND:
      statusCode = 404;
      break;
    case ERROR_TYPES.VALIDATION_ERROR:
      statusCode = 400;
      break;
    case ERROR_TYPES.CONFLICT:
      statusCode = 409;
      break;
    case ERROR_TYPES.INTERNAL_ERROR:
    default:
      statusCode = 500;
      break;
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        type: error.type,
        message: error.message,
        details: error.details
      }
    });
  }

  // Fallback for unexpected, unhandled errors
  console.error('Unhandled Error:', error);
  return res.status(500).json({
    success: false,
    error: {
      type: ERROR_TYPES.INTERNAL_ERROR,
      message: 'An unexpected error occurred'
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
