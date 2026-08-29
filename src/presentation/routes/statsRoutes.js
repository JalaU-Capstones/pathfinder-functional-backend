'use strict';

const { Router } = require('express');
const statsController = require('../controllers/statsController');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Stats
 *     description: "API usage statistics and aggregations.
 *       Data is collected by the tracking middleware on all
 *       /api/* routes and aggregated using functional
 *       programming techniques (filter, map, reduce)."
 */

/**
 * @swagger
 * /stats/requests:
 *   get:
 *     summary: "Total requests by endpoint and method"
 *     description: "Returns total request count and a
 *       breakdown per endpoint and HTTP method. Computed
 *       using groupBy (reduce) and countByMethod (reduce)."
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: "Request statistics retrieved"
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
 *                     total_requests:
 *                       type: integer
 *                       example: 150
 *                     breakdown:
 *                       type: object
 *                       example:
 *                         "/api/maps":
 *                           GET: 50
 *                           POST: 10
 *                         "/api/routes":
 *                           POST: 30
 */
router.get('/requests', statsController.getRequestStats);

/**
 * @swagger
 * /stats/response-times:
 *   get:
 *     summary: "Response times per endpoint"
 *     description: "Returns avg, min, and max response time
 *       in milliseconds for each endpoint. Computed using
 *       reduce over raw responseTimeMs values per endpoint
 *       group."
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: "Response time stats retrieved"
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
 *                   example:
 *                     "/api/maps":
 *                       avg: 45
 *                       min: 12
 *                       max: 210
 *                     "/api/routes":
 *                       avg: 320
 *                       min: 180
 *                       max: 850
 */
router.get(
  '/response-times',
  statsController.getResponseTimeStats
);

/**
 * @swagger
 * /stats/status-codes:
 *   get:
 *     summary: "Request count by HTTP status code"
 *     description: "Returns how many times each HTTP status
 *       code was returned across all endpoints. Computed
 *       using a single reduce over all stat records."
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: "Status code stats retrieved"
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
 *                   example:
 *                     "200": 130
 *                     "201": 20
 *                     "404": 8
 *                     "422": 2
 */
router.get('/status-codes', statsController.getStatusCodeStats);

/**
 * @swagger
 * /stats/popular-endpoints:
 *   get:
 *     summary: "Endpoints ranked by request count"
 *     description: "Returns all endpoints ranked by total
 *       request count (most popular first), plus the single
 *       most popular endpoint. Computed using groupBy
 *       (reduce), map, filter, and sort."
 *     tags:
 *       - Stats
 *     responses:
 *       200:
 *         description: "Popular endpoints retrieved"
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
 *                     most_popular:
 *                       type: string
 *                       example: "/api/maps"
 *                     request_count:
 *                       type: integer
 *                       example: 80
 *                     ranked:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                           request_count:
 *                             type: integer
 */
router.get(
  '/popular-endpoints',
  statsController.getPopularEndpoints
);

module.exports = router;
