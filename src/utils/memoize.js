'use strict';

/**
 * @fileoverview Memoization utility for the Pathfinder backend.
 *
 * Memoization is a functional programming optimization technique
 * that caches the results of pure function calls. When the same
 * input is received again, the cached result is returned instead
 * of recomputing, improving performance for expensive operations.
 *
 * Suitable for pure functions only: same input must always
 * produce the same output, with no side effects.
 *
 * Assignment 7.4 context:
 * - Point 3: memoize pathfinding for complex map geometries.
 * - Point 7: memoize pathfinding for large maps with many
 *   obstacles and stopping points.
 */

/**
 * memoize — wraps a pure function with a cache.
 * Subsequent calls with the same arguments return the
 * cached result without re-executing the function.
 *
 * Cache key strategy: JSON.stringify of all arguments.
 * This works correctly for plain objects, arrays, numbers,
 * and strings. Do not use with functions, Dates, or
 * circular references as arguments.
 *
 * @param {Function} fn - A pure function to memoize.
 * @returns {Function} The memoized version of fn.
 *   The returned function has a `.cache` property
 *   (a Map) for inspection and testing.
 *
 * @example
 * const expensiveCalc = (x, y) => x * y;
 * const memoized = memoize(expensiveCalc);
 * memoized(3, 4); // computes: 12
 * memoized(3, 4); // returns cached: 12 (no recomputation)
 */
const memoize = (fn) => {
  const cache = new Map();

  const memoized = (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  // Expose cache for inspection and cache-clearing in tests
  memoized.cache = cache;

  return memoized;
};

/**
 * memoizeAsync — wraps an async pure function with a cache.
 * Caches the Promise result so that concurrent calls with
 * the same arguments share one Promise (no duplicate async
 * work). Once resolved, subsequent calls return the cached
 * resolved value immediately.
 *
 * Important: if the Promise rejects, the rejection is
 * removed from the cache so the operation can be retried.
 * This prevents permanently caching transient errors.
 *
 * @param {Function} fn - An async pure function to memoize.
 * @returns {Function} The memoized async version of fn.
 *   Has a `.cache` property (Map) for inspection.
 *
 * @example
 * const fetchData = async (id) => expensiveDbCall(id);
 * const memoizedFetch = memoizeAsync(fetchData);
 * await memoizedFetch('abc'); // fetches
 * await memoizedFetch('abc'); // returns cached result
 */
const memoizeAsync = (fn) => {
  const cache = new Map();

  const memoized = async (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const promise = fn(...args).catch((error) => {
      // Remove failed promise from cache so it can be retried
      cache.delete(key);
      return Promise.reject(error);
    });

    cache.set(key, promise);
    return promise;
  };

  memoized.cache = cache;

  return memoized;
};

/**
 * memoizeWithLimit — memoization with a maximum cache size.
 * When the cache reaches maxSize, the oldest entry is
 * evicted (FIFO eviction) before adding the new result.
 *
 * Use for functions called with many different inputs
 * (e.g., pathfinding on large maps) where unbounded caching
 * would cause excessive memory usage.
 *
 * @param {Function} fn - A pure function to memoize.
 * @param {number} maxSize - Maximum number of cached results.
 *   Must be a positive integer. Recommended: 100-1000
 *   depending on the size of individual cached values.
 * @returns {Function} The memoized version with size limit.
 *
 * @example
 * const memoizedPath = memoizeWithLimit(calculatePath, 500);
 */
const memoizeWithLimit = (fn, maxSize) => {
  if (!Number.isInteger(maxSize) || maxSize < 1) {
    throw new Error(
      'memoizeWithLimit: maxSize must be a positive integer.'
    );
  }

  const cache = new Map();

  const memoized = (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    // Evict oldest entry (Map preserves insertion order)
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;

  return memoized;
};

module.exports = { memoize, memoizeAsync, memoizeWithLimit };
