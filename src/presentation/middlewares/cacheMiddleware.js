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
   * isMutating -- pure predicate.
   * Returns true for HTTP methods that change server state.
   * These are the methods that must trigger cache invalidation
   * after a successful response.
   *
   * @param {Object} req - Express request object.
   * @returns {boolean}
   */
  const MUTATING_METHODS = Object.freeze(
    new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
  );
  const isMutating = (req) => MUTATING_METHODS.has(req.method);

  /**
   * getEntityPrefix -- pure function.
   * Extracts the entity-level GET cache key prefix from a URL.
   * Used to find and delete all cached GET responses for a
   * given entity after a mutation.
   *
   * Examples:
   *   "/api/maps"           → "GET:/api/maps"
   *   "/api/maps/uuid-123"  → "GET:/api/maps"
   *   "/api/maps?page=1"    → "GET:/api/maps"
   *   "/api/obstacles"      → "GET:/api/obstacles"
   *
   * @param {string} url - The request's originalUrl.
   * @returns {string|null} Cache key prefix, or null for
   *   paths that do not match /api/<entity>.
   */
  const getEntityPrefix = (url) => {
    const match = url.match(/^(\/api\/[^/?]+)/);
    return match ? `GET:${match[1]}` : null;
  };

  /**
   * invalidateEntityCache -- side-effecting function.
   * Removes all GET cache entries whose key starts with
   * the entity prefix derived from the given URL.
   * Called only after a successful (2xx) mutating request.
   *
   * @param {string} url - The mutating request's originalUrl.
   * @returns {void}
   */
  const invalidateEntityCache = (url) => {
    const prefix = getEntityPrefix(url);
    if (!prefix) return;
    const matchingKeys = cache.keys().filter((k) => k.startsWith(prefix));
    matchingKeys.forEach((k) => cache.delete(k));
    if (matchingKeys.length > 0) {
      logger.debug('Cache invalidated', { prefix, count: matchingKeys.length });
    }
  };

  /**
   * The middleware function.
   * On cache hit: responds immediately with cached data,
   *   adds X-Cache: HIT header.
   * On cache miss: intercepts res.json to capture the
   *   response, caches it, adds X-Cache: MISS header.
   * Mutating requests (POST/PUT/PATCH/DELETE): passes through
   *   but intercepts res.json to invalidate matching GET
   *   cache entries on any successful (2xx) response.
   * Other non-GET requests: passes through unchanged.
   */
  return (req, res, next) => {
    if (!isCacheable(req)) {
      // Intercept res.json for mutating requests so we can
      // invalidate stale GET cache entries on success.
      if (isMutating(req)) {
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            invalidateEntityCache(req.originalUrl);
          }
          return originalJson(body);
        };
      }
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
