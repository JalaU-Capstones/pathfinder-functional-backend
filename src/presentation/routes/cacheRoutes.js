'use strict';

/**
 * @fileoverview Cache monitoring routes.
 * Provides an endpoint to inspect the current state of
 * the response cache. Development and operations use only.
 */

const { Router } = require('express');
const { createCacheController } = require('../controllers/cacheController');

/**
 * createCacheRouter -- factory that returns an Express
 * router wired to the cache controller.
 *
 * @param {Object} cache - LRU cache instance.
 * @returns {Router} Configured Express router.
 */
const createCacheRouter = (cache) => {
  const router = Router();
  const { getCacheStats } = createCacheController(cache);

  /**
   * @swagger
   * /api/cache/stats:
   *   get:
   *     summary: "Get cache statistics"
   *     description: "Returns current LRU cache state including size, max, maxAge and expired entry count. Available in development only."
   *     tags:
   *       - Cache
   *     responses:
   *       200:
   *         description: "Cache statistics retrieved successfully"
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     size:
   *                       type: integer
   *                       description: "Current number of valid cached entries"
   *                       example: 12
   *                     max:
   *                       type: integer
   *                       description: "Maximum cache capacity"
   *                       example: 50
   *                     maxAge:
   *                       type: integer
   *                       description: "TTL in milliseconds"
   *                       example: 30000
   *                     expiredCount:
   *                       type: integer
   *                       description: "Number of expired but not yet evicted entries"
   *                       example: 2
   */
  router.get('/stats', getCacheStats);

  return router;
};

module.exports = { createCacheRouter };
