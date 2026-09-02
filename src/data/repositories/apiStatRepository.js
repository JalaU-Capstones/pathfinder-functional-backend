'use strict';

/**
 * @fileoverview ApiStat repository.
 *
 * The ONLY file allowed to call the Sequelize ApiStat
 * model directly. All other layers (service, middleware)
 * interact with the database through these functions.
 *
 * Single responsibility: data access for API statistics.
 * No business logic, no aggregations, no HTTP concerns.
 */

const { ApiStat } = require('../models');
const { Sequelize } = require('sequelize');


/**
 * createStat — persists one request tracking record.
 *
 * Called by the tracking middleware after each request
 * completes. Designed to be non-blocking: errors are
 * caught and logged without interrupting the response.
 *
 * @param {Object} data
 * @param {string} data.endpointAccess - Normalized path
 * @param {string} data.requestMethod  - HTTP method
 * @param {number} data.statusCode     - Response status
 * @param {number} data.responseTimeMs - Duration in ms
 * @param {string|null} [data.userId]  - Optional user ID
 * @param {Date} [data.timestamp]      - Request time
 * @returns {Promise<ApiStat>}
 */
const createStat = (data) =>
  ApiStat.create({
    endpointAccess: data.endpointAccess,
    requestMethod: data.requestMethod,
    statusCode: data.statusCode,
    responseTimeMs: data.responseTimeMs,
    userId: data.userId || null,
    timestamp: data.timestamp || new Date(),
  });

/**
 * getAllStats — retrieves all tracking records.
 * Ordered by timestamp descending (most recent first).
 * Used by the stats service to compute aggregations.
 *
 * @returns {Promise<ApiStat[]>}
 */
const getAllStats = () =>
  ApiStat.findAll({
    order: [['timestamp', 'DESC']],
  });

/**
 * getStatsByEndpoint — retrieves all records for a
 * specific endpoint path.
 *
 * @param {string} endpointAccess - The normalized path.
 * @returns {Promise<ApiStat[]>}
 */
const getStatsByEndpoint = (endpointAccess) =>
  ApiStat.findAll({
    where: { endpointAccess },
    order: [['timestamp', 'DESC']],
  });

/**
 * getStatCount — returns the total number of tracked
 * requests. Uses COUNT at the DB level for efficiency.
 *
 * @returns {Promise<number>}
 */
const getStatCount = () => ApiStat.count();

/**
 * clearStats — removes all tracking records.
 * Intended for development/testing use only.
 * Not exposed via any API endpoint.
 *
 * @returns {Promise<number>} Count of deleted records.
 */
const clearStats = () =>
  ApiStat.destroy({ where: {}, truncate: true });



/**
 * getRequestStats — counts grouped by endpoint+method for a user.
 *
 * @param {string|null} userId - The authenticated user's ID, or null.
 * @returns {Promise<{ total_requests: number, breakdown: Object }>}
 */
const getRequestStats = async (userId) => {
  const where = userId ? { userId } : { userId: null };

  const stats = await ApiStat.findAll({
    where,
    attributes: [
      'endpointAccess',
      'requestMethod',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    group: ['endpointAccess', 'requestMethod'],
    raw: true,
  });

  const total_requests = stats.reduce(
    (sum, r) => sum + Number(r.count), 0
  );

  const breakdown = stats.reduce((acc, s) => {
    if (!acc[s.endpointAccess]) acc[s.endpointAccess] = {};
    acc[s.endpointAccess][s.requestMethod] = Number(s.count);
    return acc;
  }, {});

  return { total_requests, breakdown };
};

/**
 * getResponseTimeStats — avg/min/max per endpoint for a user.
 *
 * @param {string|null} userId
 * @returns {Promise<Object>} Map of endpoint → { avg, min, max }
 */
const getResponseTimeStats = async (userId) => {
  const where = userId ? { userId } : { userId: null };

  const rows = await ApiStat.findAll({
    where,
    attributes: [
      'endpointAccess',
      [Sequelize.fn('AVG', Sequelize.col('responseTimeMs')), 'avg'],
      [Sequelize.fn('MIN', Sequelize.col('responseTimeMs')), 'min'],
      [Sequelize.fn('MAX', Sequelize.col('responseTimeMs')), 'max'],
    ],
    group: ['endpointAccess'],
    raw: true,
  });

  return rows.reduce((acc, r) => {
    acc[r.endpointAccess] = {
      avg: Math.round(Number(r.avg)),
      min: Number(r.min),
      max: Number(r.max),
    };
    return acc;
  }, {});
};

/**
 * getStatusCodeStats — request count per HTTP status for a user.
 *
 * @param {string|null} userId
 * @returns {Promise<Object>} Map of statusCode (string) → count
 */
const getStatusCodeStats = async (userId) => {
  const where = userId ? { userId } : { userId: null };

  const rows = await ApiStat.findAll({
    where,
    attributes: [
      'statusCode',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    group: ['statusCode'],
    raw: true,
  });

  return rows.reduce((acc, r) => {
    acc[String(r.statusCode)] = Number(r.count);
    return acc;
  }, {});
};

/**
 * getPopularEndpoints — endpoints ranked by request count for a user.
 *
 * @param {string|null} userId
 * @returns {Promise<{ most_popular: string, request_count: number, ranked: Array }>}
 */
const getPopularEndpoints = async (userId) => {
  const where = userId ? { userId } : { userId: null };

  const rows = await ApiStat.findAll({
    where,
    attributes: [
      'endpointAccess',
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'request_count'],
    ],
    group: ['endpointAccess'],
    order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
    raw: true,
  });

  const ranked = rows.map((r) => ({
    endpoint: r.endpointAccess,
    request_count: Number(r.request_count),
  }));

  return {
    most_popular: ranked[0]?.endpoint || 'None yet',
    request_count: ranked[0]?.request_count || 0,
    ranked,
  };
};

module.exports = {
  createStat,
  getAllStats,
  getStatsByEndpoint,
  getStatCount,
  clearStats,
  getRequestStats,
  getResponseTimeStats,
  getStatusCodeStats,
  getPopularEndpoints,
};

