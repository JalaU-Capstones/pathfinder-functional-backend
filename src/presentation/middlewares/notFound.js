const { createAppError, ERROR_TYPES } = require('../../utils/errors');

const notFound = (req, res, next) => {
  const err = createAppError(
    ERROR_TYPES.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found`
  );
  next(err);
};

module.exports = { notFound };
