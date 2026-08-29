'use strict';

/**
 * @fileoverview Stats controller.
 * One function per endpoint. Parses request, calls
 * the service, sends response. No business logic.
 */

const statsService = require('../../business/services/statsService');
const { sendSuccess } = require('../../utils/httpResponse');

/**
 * getRequestStats — GET /stats/requests
 * Total requests and breakdown by endpoint and method.
 */
const getRequestStats = async (req, res, next) => {
  try {
    const data = await statsService.getRequestStats();
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

/**
 * getResponseTimeStats — GET /stats/response-times
 * Avg, min, max response time per endpoint.
 */
const getResponseTimeStats = async (req, res, next) => {
  try {
    const data = await statsService.getResponseTimeStats();
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

/**
 * getStatusCodeStats — GET /stats/status-codes
 * Count of each HTTP status code returned.
 */
const getStatusCodeStats = async (req, res, next) => {
  try {
    const data = await statsService.getStatusCodeStats();
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

/**
 * getPopularEndpoints — GET /stats/popular-endpoints
 * Endpoints ranked by request count, most popular first.
 */
const getPopularEndpoints = async (req, res, next) => {
  try {
    const data = await statsService.getPopularEndpoints();
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
