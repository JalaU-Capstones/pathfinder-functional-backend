/**
 * Centralized Winston logging configuration for the application.
 */
const winston = require('winston');

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat
    })
  ]
});

/**
 * logValidationError — logs validation errors from the
 * new recursive and concurrent validation endpoints.
 * Captures: endpoint, input summary, error message, timestamp.
 *
 * @param {string} endpoint - The validation endpoint called.
 * @param {Object} input - Sanitized input (no sensitive data).
 * @param {Error} error - The validation error thrown.
 */
const logValidationError = (endpoint, input, error) => {
  logger.warn('Validation error', {
    endpoint,
    input,
    errorCode: error.code || 'UNKNOWN',
    message: error.message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * logConcurrencyEvent — logs parallel validation events,
 * useful for monitoring Promise.all / Promise.allSettled
 * execution patterns in production.
 *
 * @param {string} operation - Name of the parallel operation.
 * @param {number} parallelCount - Number of parallel tasks.
 * @param {number} durationMs - Total execution time.
 * @param {number} failedCount - Number of tasks that failed.
 */
const logConcurrencyEvent = (
  operation, parallelCount, durationMs, failedCount
) => {
  logger.info('Concurrency event', {
    operation,
    parallelCount,
    durationMs,
    failedCount,
    timestamp: new Date().toISOString(),
  });
};

/**
 * logRecursionDepth — logs when recursive functions reach
 * significant depth, useful for detecting abnormal inputs.
 *
 * @param {string} functionName - The recursive function name.
 * @param {number} depth - Current recursion depth reached.
 * @param {*} input - Sanitized input summary.
 */
const logRecursionDepth = (functionName, depth, input) => {
  if (depth > 2) {
    logger.debug('Recursion depth event', {
      functionName,
      depth,
      input,
      timestamp: new Date().toISOString(),
    });
  }
};

logger.logValidationError = logValidationError;
logger.logConcurrencyEvent = logConcurrencyEvent;
logger.logRecursionDepth = logRecursionDepth;

module.exports = logger;
