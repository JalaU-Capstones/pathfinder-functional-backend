'use strict';

/**
 * @fileoverview Stats controller.
 * One function per endpoint. Parses request, calls
 * the service, sends response. No business logic.
 *
 * userId is extracted from req.user.userId (set by
 * authMiddleware after JWT verification) and threaded
 * through to the service + repository so each user
 * sees only their own tracking data.
 */

const {
  getRequestStatsService,
  getResponseTimeStatsService,
  getStatusCodeStatsService,
  getPopularEndpointsService,
} = require('../../business/services/statsService');
const { sendSuccess } = require('../../utils/httpResponse');

/**
 * getRequestStats — GET /api/stats/requests
 * Total requests and breakdown by endpoint and method,
 * filtered to the authenticated user only.
 */
const getRequestStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    const data = await getRequestStatsService(userId);
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

/**
 * getResponseTimeStats — GET /api/stats/response-times
 * Avg, min, max response time per endpoint,
 * filtered to the authenticated user only.
 */
const getResponseTimeStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    const data = await getResponseTimeStatsService(userId);
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

/**
 * getStatusCodeStats — GET /api/stats/status-codes
 * Count of each HTTP status code returned,
 * filtered to the authenticated user only.
 */
const getStatusCodeStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    const data = await getStatusCodeStatsService(userId);
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

/**
 * getPopularEndpoints — GET /api/stats/popular-endpoints
 * Endpoints ranked by request count, most popular first,
 * filtered to the authenticated user only.
 */
const getPopularEndpoints = async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    const data = await getPopularEndpointsService(userId);
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRequestStats,
  getResponseTimeStats,
  getStatusCodeStats,
  getPopularEndpoints,
};
