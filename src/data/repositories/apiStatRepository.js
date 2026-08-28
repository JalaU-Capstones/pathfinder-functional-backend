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

module.exports = {
  createStat,
  getAllStats,
  getStatsByEndpoint,
  getStatCount,
  clearStats,
};
