'use strict';

/**
 * @fileoverview Cache monitoring controller.
 * Exposes cache statistics for operational monitoring.
 * Single responsibility: HTTP layer for cache stats only.
 */

const { sendSuccess } = require('../../utils/httpResponse');

/**
 * createCacheController -- factory that returns a cache
 * stats route handler. The cache instance is injected via
 * closure when the controller factory is called,
 * maintaining DIP.
 *
 * @param {Object} cache - LRU cache instance with stats().
 * @returns {{ getCacheStats: Function }} Route handler map.
 */
const createCacheController = (cache) => {
  /**
   * getCacheStats -- returns current cache statistics.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware.
   * @returns {Object} HTTP response with cache stats.
   */
  const getCacheStats = (req, res, next) => {
    try {
      const stats = cache.stats();
      return sendSuccess(res, 200, stats);
    } catch (error) {
      return next(error);
    }
  };

  return { getCacheStats };
};

module.exports = { createCacheController };
