const ERROR_TYPES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFLICT: 'CONFLICT'
};

const createAppError = (type, message, details = null) => {
  return {
    isAppError: true,
    type,
    message,
    details
  };
};

module.exports = {
  ERROR_TYPES,
  createAppError
};
