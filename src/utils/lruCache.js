'use strict';

/**
 * @fileoverview LRU (Least Recently Used) cache with TTL
 * (Time To Live) support. Implements a configurable cache
 * data structure for the Week 7 Lab memoization middleware.
 *
 * Key properties:
 * - LRU eviction: when full, removes the least recently
 *   accessed entry (not the oldest inserted).
 * - TTL with access reset: entry expiration is reset on
 *   every read, keeping active data alive.
 * - Functional techniques: filter for expired entry
 *   detection, accumulator (reduce) for size tracking,
 *   pipe for composing eviction operations.
 *
 * No external libraries. All logic is manual.
 *
 * Lab Week 7 Activity 1 - Pathfinder Functional Backend
 */

/**
 * createLRUCache — factory function that creates a new
 * LRU cache instance with the given configuration.
 *
 * Uses a factory pattern (not a class) to remain consistent
 * with the functional paradigm of this project.
 *
 * LRU vs FIFO distinction:
 * The existing memoizeWithLimit in memoize.js uses FIFO
 * (First In, First Out) eviction: when the cache is full,
 * the oldest INSERTED entry is removed regardless of how
 * recently it was accessed.
 *
 * LRU (Least Recently Used) eviction is different: when
 * the cache is full, the entry that was accessed LEAST
 * RECENTLY is removed. An entry accessed 1 second ago is
 * retained over an entry inserted 1 minute ago but never
 * accessed since. LRU is more effective for API response
 * caching because frequently requested data stays cached
 * longer regardless of insertion order.
 *
 * Data structure strategy:
 * A JavaScript Map is used as primary storage because:
 * - Map preserves insertion order (used for LRU ordering).
 * - Map has O(1) get, set, has, and delete operations.
 * - LRU ordering is maintained by deleting and re-inserting
 *   an entry on every access. The most recently accessed
 *   entry is always last; the least recently accessed is
 *   always first in Map iteration order.
 *
 * @param {Object} options - Cache configuration.
 * @param {number} options.max - Maximum number of entries.
 *   Must be a positive integer. When reached, the LRU
 *   entry is evicted before inserting the new one.
 * @param {number} options.maxAge - Entry TTL in milliseconds.
 *   An entry is expired when Date.now() - lastAccessed
 *   exceeds maxAge. The timer resets on every read.
 * @returns {Object} Cache instance with get, set, has,
 *   delete, clear, size, and stats methods.
 * @throws {Error} If options.max or options.maxAge are
 *   not positive integers.
 */
const createLRUCache = ({ max, maxAge }) => {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error(
      'createLRUCache: max must be a positive integer.'
    );
  }
  if (!Number.isInteger(maxAge) || maxAge < 1) {
    throw new Error(
      'createLRUCache: maxAge must be a positive integer.'
    );
  }

  /**
   * Internal Map storage. Keys are cache key strings.
   * Values are objects: { value, lastAccessed: number }.
   */
  const store = new Map();

  // --------------- Internal pure helper functions ----------------

  /**
   * isExpired — pure predicate.
   * Returns true if the entry's lastAccessed timestamp
   * is older than maxAge milliseconds from now.
   *
   * @param {{ lastAccessed: number }} entry
   * @returns {boolean}
   */
  const isExpired = (entry) =>
    Date.now() - entry.lastAccessed > maxAge;

  /**
   * getExpiredKeys — uses Array filter to collect all
   * keys whose entries are expired.
   * Filter technique: selects only entries satisfying
   * the isExpired predicate, then maps to keys.
   *
   * @returns {string[]} Array of expired cache keys.
   */
  const getExpiredKeys = () =>
    [...store.entries()]
      .filter(([, entry]) => isExpired(entry))
      .map(([key]) => key);

  /**
   * evictExpired — removes all expired entries from store.
   * Uses filter to identify them, then deletes each.
   * Returns the number of evicted entries.
   *
   * @returns {number} Count of evicted entries.
   */
  const evictExpired = () => {
    const expiredKeys = getExpiredKeys();
    expiredKeys.forEach((key) => store.delete(key));
    return expiredKeys.length;
  };

  /**
   * getLRUKey — returns the key of the least recently
   * used entry (the entry with the minimum lastAccessed
   * timestamp).
   *
   * Accumulator technique: reduce over Map entries to
   * find the entry with the minimum lastAccessed value.
   * The initial accumulator value is the first key in
   * iteration order, which is also the oldest insertion
   * and thus a safe starting candidate.
   *
   * @returns {string|null} The LRU key, or null if empty.
   */
  const getLRUKey = () => {
    if (store.size === 0) return null;

    return [...store.entries()].reduce(
      (lruKey, [key, entry]) => {
        const lruEntry = store.get(lruKey);
        return entry.lastAccessed < lruEntry.lastAccessed
          ? key
          : lruKey;
      },
      store.keys().next().value
    );
  };

  /**
   * evictLRU — removes the least recently used entry.
   * Called when store.size >= max after expired eviction.
   *
   * @returns {boolean} True if an entry was evicted.
   */
  const evictLRU = () => {
    const lruKey = getLRUKey();
    if (lruKey === null) return false;
    store.delete(lruKey);
    return true;
  };

  /**
   * ensureCapacity — pipe of eviction operations:
   * Step 1: evict all expired entries (filter technique).
   * Step 2: if still at or over capacity, evict LRU
   *         (accumulator technique).
   *
   * This composes the two eviction strategies in sequence,
   * preferring to remove already-expired entries before
   * resorting to LRU eviction of valid entries.
   */
  const ensureCapacity = () => {
    evictExpired();
    if (store.size >= max) {
      evictLRU();
    }
  };

  // -------------------- Public API methods ----------------------

  /**
   * set — stores a value in the cache under the given key.
   * If the cache is full, evicts expired entries first,
   * then the LRU entry if still needed.
   * If the key already exists, updates its value and
   * resets its lastAccessed timestamp without triggering
   * capacity eviction (the count does not increase).
   *
   * @param {string} key - Cache key.
   * @param {*} value - Value to cache.
   * @returns {void}
   */
  const set = (key, value) => {
    if (store.has(key)) {
      // Remove first so re-insertion moves it to MRU position
      store.delete(key);
    } else {
      ensureCapacity();
    }
    store.set(key, { value, lastAccessed: Date.now() });
  };

  /**
   * get — retrieves a value from the cache.
   * Returns undefined if the key does not exist or if
   * the entry has expired. On a valid hit, resets the
   * lastAccessed timestamp (extends TTL) and moves the
   * entry to most-recently-used position via
   * delete-and-reinsert.
   *
   * @param {string} key - Cache key.
   * @returns {*} The cached value, or undefined on miss.
   */
  const get = (key) => {
    if (!store.has(key)) return undefined;

    const entry = store.get(key);

    if (isExpired(entry)) {
      store.delete(key);
      return undefined;
    }

    // Move to most-recently-used position by re-inserting
    store.delete(key);
    store.set(key, { value: entry.value, lastAccessed: Date.now() });

    return entry.value;
  };

  /**
   * has — returns true if the key exists and has not expired.
   * Does NOT reset the lastAccessed timestamp (read-only
   * check). Expired entries are removed as a side effect
   * of the check to keep the store clean.
   *
   * @param {string} key - Cache key.
   * @returns {boolean}
   */
  const has = (key) => {
    if (!store.has(key)) return false;
    const entry = store.get(key);
    if (isExpired(entry)) {
      store.delete(key);
      return false;
    }
    return true;
  };

  /**
   * delete — removes an entry from the cache regardless
   * of its TTL status.
   *
   * @param {string} key - Cache key.
   * @returns {boolean} True if the key existed and was removed.
   */
  const del = (key) => store.delete(key);

  /**
   * clear — removes all entries from the cache.
   *
   * @returns {void}
   */
  const clear = () => store.clear();

  /**
   * size — returns the count of currently valid
   * (non-expired) entries using an accumulator (reduce).
   *
   * Accumulator technique: reduces the Map entries into
   * a single integer count, incrementing only for entries
   * that are not expired. This reports the true usable
   * count rather than raw store.size, which may include
   * expired entries not yet cleaned up.
   *
   * @returns {number}
   */
  const size = () =>
    [...store.entries()].reduce(
      (count, [, entry]) => (isExpired(entry) ? count : count + 1),
      0
    );

  /**
   * stats — returns a snapshot of cache state.
   * Useful for the monitoring endpoint in Phase Lab7B
   * without coupling the cache to HTTP concerns.
   *
   * @returns {{ size: number, max: number, maxAge: number,
   *             expiredCount: number }}
   */
  const stats = () => {
    const expiredCount = getExpiredKeys().length;
    return {
      size: size(),
      max,
      maxAge,
      expiredCount,
    };
  };

  return Object.freeze({ set, get, has, delete: del, clear, size, stats });
};

module.exports = { createLRUCache };
