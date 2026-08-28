'use strict';

/**
 * @fileoverview API usage tracking middleware.
 *
 * Lab Week 8 - Activity 1
 *
 * Implements two HOF patterns:
 *
 * 1. trackingMiddleware (Express middleware, used globally):
 *    Applied via app.use('/api', trackingMiddleware). Intercepts
 *    every request, measures response time, and persists a
 *    tracking record to the ApiStats table after the response
 *    is sent. Non-blocking: DB errors are logged but never
 *    propagated to the client.
 *
 * 2. withTracking (HOF controller wrapper):
 *    Takes a controller function and returns a new function
 *    that adds tracking logic around the original. Exported
 *    for documentation and explicit HOF demonstration.
 *    Usage: router.get('/path', withTracking(controller.fn))
 *
 * Both achieve the same result via different composition
 * strategies. The global middleware is used in production
 * because it requires no changes to existing controllers.
 */

const { createStat } = require(
  '../../data/repositories/apiStatRepository'
);
const { logger } = require('../../utils/logger');

// ─── Pure helpers ─────────────────────────────────────────────

/**
 * UUID_PATTERN — regex matching UUID v4 path segments.
 * Used by normalizePath to replace dynamic IDs with :id.
 */
const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * normalizePath — pure function.
 * Strips query strings and replaces UUID segments with :id.
 * Groups dynamic routes for meaningful aggregation.
 *
 * @param {string} path - Raw request path.
 * @returns {string} Normalized path string.
 *
 * @example
 * normalizePath('/api/maps/3b47e69f-...')
 * // returns '/api/maps/:id'
 *
 * normalizePath('/api/obstacles?mapId=3b47e69f-...')
 * // returns '/api/obstacles'
 */
const normalizePath = (path) =>
  path
    .split('?')[0]
    .replace(UUID_PATTERN, ':id');

/**
 * buildStatPayload — pure function.
 * Constructs the ApiStat record from request/response data.
 * Centralizes the field mapping in one place (SRP).
 *
 * @param {Object} req - Express request object.
 * @param {number} statusCode - HTTP response status code.
 * @param {number} responseTimeMs - Duration in milliseconds.
 * @returns {Object} Payload for apiStatRepository.createStat
 */
const buildStatPayload = (req, statusCode, responseTimeMs) => ({
  endpointAccess: normalizePath(req.originalUrl || req.url),
  requestMethod: req.method,
  statusCode,
  responseTimeMs,
  userId: req.user?.id || null,
  timestamp: new Date(),
});

/**
 * persistStat — saves one tracking record to the database.
 * Errors are caught and logged — never thrown to the caller.
 * Tracking must never break the API response flow.
 *
 * @param {Object} payload - Data for createStat.
 * @returns {Promise<void>}
 */
const persistStat = async (payload) => {
  try {
    await createStat(payload);
  } catch (error) {
    logger.error('Tracking middleware: failed to persist stat', {
      error: error.message,
      payload,
    });
  }
};

// ─── Approach A — Global Express middleware ────────────────────

/**
 * trackingMiddleware — Express middleware applied globally.
 *
 * HOF nature: it is a function (req, res, next) => void that
 * wraps the response lifecycle. It overrides res.json to
 * intercept the status code at the moment the response is
 * sent — the same technique used in cacheMiddleware.
 *
 * Execution flow:
 * 1. Record start time.
 * 2. Override res.json to capture status code + timing.
 * 3. Call next() — request proceeds normally.
 * 4. When the route handler calls res.json, the override
 *    fires, computes responseTimeMs, persists the stat
 *    asynchronously, then calls the original res.json.
 *
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Next middleware function.
 */
const trackingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalJson = res.json.bind(res);

  /**
   * Override res.json — this is where the HOF composition
   * happens. The original res.json is wrapped with tracking
   * logic. The wrapper:
   * 1. Captures the status code and elapsed time.
   * 2. Fires persistStat asynchronously (non-blocking).
   * 3. Calls the original res.json with the original body.
   *
   * Using res.json (not res.send or res.end) because all
   * entity controllers use res.json via httpResponse.js.
   */
  res.json = (body) => {
    const responseTimeMs = Date.now() - startTime;
    const payload = buildStatPayload(
      req, res.statusCode, responseTimeMs
    );

    // Non-blocking: do not await, do not chain .catch here
    // persistStat handles its own errors internally
    persistStat(payload);

    return originalJson(body);
  };

  next();
};

// ─── Approach B — HOF controller wrapper ──────────────────────

/**
 * withTracking — Higher-Order Function that wraps a
 * controller function with tracking logic.
 *
 * This is the explicit HOF pattern: a function that takes
 * a function (controllerFn) and returns a new function
 * with additional behavior. The original controller is
 * called inside the wrapper without modification.
 *
 * Used for documentation and rubric demonstration. The
 * global trackingMiddleware covers all routes automatically,
 * so withTracking does not need to be applied manually.
 *
 * @param {Function} controllerFn - Any Express controller.
 * @returns {Function} New controller with tracking added.
 *
 * @example
 * // Explicit HOF usage on a single route:
 * router.get('/api/maps', withTracking(mapController.getAllMaps));
 */
const withTracking = (controllerFn) => async (req, res, next) => {
  const startTime = Date.now();
  try {
    await controllerFn(req, res, next);
  } finally {
    // fires even if controllerFn throws
    const responseTimeMs = Date.now() - startTime;
    const payload = buildStatPayload(
      req, res.statusCode || 500, responseTimeMs
    );
    persistStat(payload);
  }
};

module.exports = {
  trackingMiddleware,
  withTracking,
  normalizePath,
  buildStatPayload,
};
