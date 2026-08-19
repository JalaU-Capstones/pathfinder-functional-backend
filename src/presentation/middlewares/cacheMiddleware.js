'use strict';

/**
 * @fileoverview LRU memoization middleware for the
 * Pathfinder backend API.
 *
 * Caches successful GET responses using an LRU cache with
 * configurable max size and TTL. Subsequent identical
 * requests are served from cache without hitting the
 * business or data layer.
 *
 * Configuration (JSON object):
 *   max    {number} - Maximum number of cached responses.
 *   maxAge {number} - TTL in milliseconds. Reset on access.
 *
 * Cache key: HTTP method + full request URL (including
 * query string). Example: "GET:/api/maps?mapId=abc123"
 *
 * Only GET requests are cached. POST, PUT, DELETE bypass
 * the cache entirely -- they have side effects and must
 * always reach the business layer.
 *
 * Lab Week 7 Activity 1 - Pathfinder Functional Backend
 */

const { createLRUCache } = require('../../utils/lruCache');
const logger = require('../../utils/logger');

/**
 * createCacheMiddleware -- factory that returns a configured
 * Express middleware function with its own LRU cache instance.
 *
 * Using a factory (not a singleton) ensures each middleware
 * instance has an isolated cache. This is important for
 * testing and for environments that may need multiple
 * cache configurations.
 *
 * @param {Object} options - Cache configuration.
 * @param {number} options.max - Max cached responses.
 * @param {number} options.maxAge - TTL in milliseconds.
 * @returns {Function} Express middleware function.
 * @throws {Error} If options are invalid (delegated to
 *   createLRUCache validation).
 *
 * @example
 * const cacheMiddleware = createCacheMiddleware({
 *   max: 50,
 *   maxAge: 30000
 * });
 * app.use('/api', cacheMiddleware);
 */
const createCacheMiddleware = ({ max, maxAge }) => {
  const cache = createLRUCache({ max, maxAge });

  /**
   * generateCacheKey -- pure function.
   * Creates a unique cache key from the request method
   * and full URL (path + query string).
   *
   * @param {Object} req - Express request object.
   * @returns {string} Cache key, e.g. "GET:/api/maps?id=1"
   */
  const generateCacheKey = (req) =>
    `${req.method}:${req.originalUrl}`;

  /**
   * isCacheable -- pure predicate.
   * Returns true only for GET requests. Other HTTP methods
   * have side effects and must never be cached.
   *
   * @param {Object} req - Express request object.
   * @returns {boolean}
   */
  const isCacheable = (req) => req.method === 'GET';

  /**
   * The middleware function.
   * On cache hit: responds immediately with cached data,
   *   adds X-Cache: HIT header.
   * On cache miss: intercepts res.json to capture the
   *   response, caches it, adds X-Cache: MISS header.
   * Non-GET requests: passes through unchanged.
   */
  return (req, res, next) => {
    if (!isCacheable(req)) {
      return next();
    }

    const key = generateCacheKey(req);
    const cached = cache.get(key);

    if (cached !== undefined) {
      logger.debug('Cache hit', { key });
      res.setHeader('X-Cache', 'HIT');
      return res.status(cached.status).json(cached.body);
    }

    // Cache miss: intercept res.json to capture response
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only cache successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, { status: res.statusCode, body });
        logger.debug('Cache set', { key, status: res.statusCode });
      }
      return originalJson(body);
    };

    return next();
  };
};

module.exports = { createCacheMiddleware };
