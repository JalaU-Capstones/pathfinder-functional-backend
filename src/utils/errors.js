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

const ERROR_STATUS_MAP = {
  [ERROR_TYPES.NOT_FOUND]: 404,
  [ERROR_TYPES.VALIDATION_ERROR]: 400,
  [ERROR_TYPES.CONFLICT]: 409,
  [ERROR_TYPES.INTERNAL_ERROR]: 500
};

module.exports = {
  ERROR_TYPES,
  ERROR_STATUS_MAP,
  createAppError
};
