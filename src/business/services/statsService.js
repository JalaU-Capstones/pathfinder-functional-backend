'use strict';

/**
 * @fileoverview Stats service — computes API usage
 * aggregations from raw ApiStat records.
 *
 * Lab Week 8 - Activity 1, Task 2
 *
 * All aggregations use functional programming techniques:
 * - reduce: accumulate counts and timing totals
 * - filter: select subsets of records
 * - map: transform records into summary shapes
 * - groupBy (via reduce): group records by a key
 *
 * Every function is pure where possible: given the same
 * array of stats, it always returns the same result.
 * Side effects (DB reads) are isolated to the repository
 * calls at the top of each service function.
 */

const {
  getAllStats,
} = require('../../data/repositories/apiStatRepository');

// ─── Pure aggregation helpers ─────────────────────────────────

/**
 * groupBy — pure HOF.
 * Groups an array of records by the value of a key
 * derived by keyFn. Uses reduce to accumulate groups.
 *
 * This is a manual implementation of groupBy since
 * JavaScript does not have it natively (unlike lodash).
 *
 * @param {Array} arr - Records to group.
 * @param {Function} keyFn - Function that returns the
 *   group key for each record.
 * @returns {Object} Map of key → array of records.
 *
 * @example
 * groupBy(stats, (s) => s.endpointAccess)
 * // { '/api/maps': [...], '/api/routes': [...] }
 */
const groupBy = (arr, keyFn) =>
  arr.reduce((groups, item) => {
    const key = keyFn(item);
    return {
      ...groups,
      [key]: [...(groups[key] || []), item],
    };
  }, {});

/**
 * computeResponseTimeStats — pure function.
 * Given an array of ApiStat records for one endpoint,
 * computes avg, min, and max response times using reduce.
 *
 * @param {Array} records - ApiStat records for one endpoint.
 * @returns {{ avg: number, min: number, max: number }}
 */
const computeResponseTimeStats = (records) => {
  if (records.length === 0) {
    return { avg: 0, min: 0, max: 0 };
  }

  const { total, min, max } = records.reduce(
    (acc, record) => ({
      total: acc.total + record.responseTimeMs,
      min: Math.min(acc.min, record.responseTimeMs),
      max: Math.max(acc.max, record.responseTimeMs),
    }),
    {
      total: 0,
      min: records[0].responseTimeMs,
      max: records[0].responseTimeMs,
    }
  );

  return {
    avg: Math.round(total / records.length),
    min,
    max,
  };
};

/**
 * countByMethod — pure function.
 * Given records for one endpoint, counts requests by
 * HTTP method using reduce.
 *
 * @param {Array} records - ApiStat records for one endpoint.
 * @returns {Object} Map of method → count.
 *
 * @example
 * countByMethod(records) // { GET: 50, POST: 30 }
 */
const countByMethod = (records) =>
  records.reduce((counts, record) => ({
    ...counts,
    [record.requestMethod]:
      (counts[record.requestMethod] || 0) + 1,
  }), {});

// ─── Service functions ────────────────────────────────────────

/**
 * getRequestStats — endpoint: GET /stats/requests
 *
 * Returns total request count and a breakdown by endpoint
 * and HTTP method.
 *
 * HOF used:
 * - groupBy (reduce): group records by endpointAccess
 * - map (Object.entries + map): transform each group
 *   into method counts
 * - reduce: count methods per endpoint
 *
 * @returns {Promise<{
 *   total_requests: number,
 *   breakdown: Object
 * }>}
 */
const getRequestStats = async () => {
  const stats = await getAllStats();

  const grouped = groupBy(stats, (s) => s.endpointAccess);

  const breakdown = Object.entries(grouped).reduce(
    (acc, [endpoint, records]) => ({
      ...acc,
      [endpoint]: countByMethod(records),
    }),
    {}
  );

  return {
    total_requests: stats.length,
    breakdown,
  };
};

/**
 * getResponseTimeStats — endpoint: GET /stats/response-times
 *
 * Returns avg, min, and max response time per endpoint.
 *
 * HOF used:
 * - groupBy (reduce): group by endpointAccess
 * - reduce inside computeResponseTimeStats: aggregate
 *   timing values
 * - Object.entries + reduce: transform grouped data
 *
 * @returns {Promise<Object>} Map of endpoint → timing stats.
 */
const getResponseTimeStats = async () => {
  const stats = await getAllStats();

  const grouped = groupBy(stats, (s) => s.endpointAccess);

  return Object.entries(grouped).reduce(
    (acc, [endpoint, records]) => ({
      ...acc,
      [endpoint]: computeResponseTimeStats(records),
    }),
    {}
  );
};

/**
 * getStatusCodeStats — endpoint: GET /stats/status-codes
 *
 * Returns a count of how many times each HTTP status
 * code was returned across all endpoints.
 *
 * HOF used:
 * - reduce: accumulate counts keyed by status code
 *
 * @returns {Promise<Object>} Map of statusCode → count.
 */
const getStatusCodeStats = async () => {
  const stats = await getAllStats();

  return stats.reduce((counts, record) => ({
    ...counts,
    [record.statusCode]:
      (counts[record.statusCode] || 0) + 1,
  }), {});
};

/**
 * getPopularEndpoints — endpoint: GET /stats/popular-endpoints
 *
 * Returns all endpoints ranked by total request count,
 * most popular first.
 *
 * HOF used:
 * - groupBy (reduce): group by endpointAccess
 * - map: transform each group into a summary object
 * - filter: remove endpoints with zero requests
 * - sort (on mapped array): rank by request_count desc
 * - find: identify the single most popular endpoint
 *
 * @returns {Promise<{
 *   most_popular: string,
 *   request_count: number,
 *   ranked: Array<{ endpoint, request_count }>
 * }>}
 */
const getPopularEndpoints = async () => {
  const stats = await getAllStats();

  if (stats.length === 0) {
    return {
      most_popular: null,
      request_count: 0,
      ranked: [],
    };
  }

  const grouped = groupBy(stats, (s) => s.endpointAccess);

  // map each endpoint group to a summary object
  const ranked = Object.entries(grouped)
    .map(([endpoint, records]) => ({
      endpoint,
      request_count: records.length,
    }))
    .filter((item) => item.request_count > 0)
    .sort((a, b) => b.request_count - a.request_count);

  // find the single most popular (first after sort)
  const top = ranked[0];

  return {
    most_popular: top.endpoint,
    request_count: top.request_count,
    ranked,
  };
};

module.exports = {
  getRequestStats,
  getResponseTimeStats,
  getStatusCodeStats,
  getPopularEndpoints,
  // Export pure helpers for unit testing in isolation
  groupBy,
  computeResponseTimeStats,
  countByMethod,
};
