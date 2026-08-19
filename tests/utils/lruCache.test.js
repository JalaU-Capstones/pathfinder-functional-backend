'use strict';
/* global jest, beforeEach, afterEach */

const { createLRUCache } = require('../../src/utils/lruCache');

describe('createLRUCache', () => {

  describe('factory validation', () => {
    it('should throw if max is not a positive integer', () => {
      expect(() => createLRUCache({ max: '5', maxAge: 1000 })).toThrow(
        'createLRUCache: max must be a positive integer.'
      );
    });

    it('should throw if max is zero', () => {
      expect(() => createLRUCache({ max: 0, maxAge: 1000 })).toThrow(
        'createLRUCache: max must be a positive integer.'
      );
    });

    it('should throw if max is negative', () => {
      expect(() => createLRUCache({ max: -3, maxAge: 1000 })).toThrow(
        'createLRUCache: max must be a positive integer.'
      );
    });

    it('should throw if max is a float', () => {
      expect(() => createLRUCache({ max: 2.5, maxAge: 1000 })).toThrow(
        'createLRUCache: max must be a positive integer.'
      );
    });

    it('should throw if maxAge is not a positive integer', () => {
      expect(() => createLRUCache({ max: 5, maxAge: 'forever' })).toThrow(
        'createLRUCache: maxAge must be a positive integer.'
      );
    });

    it('should throw if maxAge is zero', () => {
      expect(() => createLRUCache({ max: 5, maxAge: 0 })).toThrow(
        'createLRUCache: maxAge must be a positive integer.'
      );
    });

    it('should create a cache with valid options', () => {
      expect(() => createLRUCache({ max: 10, maxAge: 5000 })).not.toThrow();
    });

    it('should return a frozen object', () => {
      const cache = createLRUCache({ max: 10, maxAge: 5000 });
      expect(Object.isFrozen(cache)).toBe(true);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    it('should return undefined for a missing key', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should overwrite an existing key', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('key', 'first');
      cache.set('key', 'second');
      expect(cache.get('key')).toBe('second');
    });

    it('should handle different value types (string, object, array, number)', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('str', 'hello');
      cache.set('obj', { x: 1, y: 2 });
      cache.set('arr', [1, 2, 3]);
      cache.set('num', 42);

      expect(cache.get('str')).toBe('hello');
      expect(cache.get('obj')).toEqual({ x: 1, y: 2 });
      expect(cache.get('arr')).toEqual([1, 2, 3]);
      expect(cache.get('num')).toBe(42);
    });
  });

  describe('TTL expiration', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('should return undefined for an expired entry', () => {
      const cache = createLRUCache({ max: 10, maxAge: 1000 });
      cache.set('key', 'value');
      jest.advanceTimersByTime(1001);
      expect(cache.get('key')).toBeUndefined();
    });

    it('should reset TTL on get (access extends expiration)', () => {
      const cache = createLRUCache({ max: 10, maxAge: 1000 });
      cache.set('key', 'value');
      jest.advanceTimersByTime(800);
      cache.get('key'); // resets TTL
      jest.advanceTimersByTime(800); // 1600ms total but TTL reset at 800ms mark
      expect(cache.get('key')).toBe('value'); // still alive
    });

    it('should expire entry without access after maxAge', () => {
      const cache = createLRUCache({ max: 10, maxAge: 500 });
      cache.set('key', 'value');
      jest.advanceTimersByTime(501);
      expect(cache.has('key')).toBe(false);
    });

    it('should not reset TTL on has (read-only check)', () => {
      const cache = createLRUCache({ max: 10, maxAge: 1000 });
      cache.set('key', 'value');
      jest.advanceTimersByTime(800);
      cache.has('key'); // must NOT reset TTL
      jest.advanceTimersByTime(300); // 1100ms total, TTL never reset
      expect(cache.get('key')).toBeUndefined();
    });
  });

  describe('LRU eviction', () => {
    it('should evict the LRU entry when max is reached', () => {
      const cache = createLRUCache({ max: 2, maxAge: 60000 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.get('a'); // 'a' is now most recently used
      cache.set('c', 3); // 'b' is LRU, should be evicted
      expect(cache.has('b')).toBe(false);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('c')).toBe(true);
    });

    it('should evict expired entries before LRU when at capacity', () => {
      jest.useFakeTimers();
      const cache = createLRUCache({ max: 2, maxAge: 1000 });
      cache.set('a', 1);
      cache.set('b', 2);
      jest.advanceTimersByTime(1001); // both entries are now expired
      cache.set('c', 3); // expired entries evicted first, no LRU eviction needed
      expect(cache.size()).toBe(1);
      expect(cache.has('c')).toBe(true);
      jest.useRealTimers();
    });

    it('should maintain LRU order across multiple accesses', () => {
      const cache = createLRUCache({ max: 3, maxAge: 60000 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.get('a'); // a is now MRU
      cache.get('b'); // b is now MRU, a is second
      cache.set('d', 4); // c is LRU (never accessed after insert), should be evicted
      expect(cache.has('c')).toBe(false);
      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('d')).toBe(true);
    });

    it('should update LRU position when an existing key is overwritten via set', () => {
      const cache = createLRUCache({ max: 2, maxAge: 60000 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('a', 99); // overwrite 'a', moves it to MRU — 'b' is now LRU
      cache.set('c', 3);  // should evict 'b'
      expect(cache.has('b')).toBe(false);
      expect(cache.get('a')).toBe(99);
      expect(cache.has('c')).toBe(true);
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired entry', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('should return false for missing key', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      expect(cache.has('missing')).toBe(false);
    });

    it('should return false and remove expired entry', () => {
      jest.useFakeTimers();
      const cache = createLRUCache({ max: 10, maxAge: 500 });
      cache.set('key', 'value');
      jest.advanceTimersByTime(501);
      expect(cache.has('key')).toBe(false);
      // Confirm the expired entry was cleaned up
      expect(cache.size()).toBe(0);
      jest.useRealTimers();
    });
  });

  describe('delete', () => {
    it('should remove an existing entry and return true', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('key', 'value');
      expect(cache.delete('key')).toBe(true);
      expect(cache.has('key')).toBe(false);
    });

    it('should return false for a non-existing key', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.clear();
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
      expect(cache.has('c')).toBe(false);
    });

    it('should result in size 0', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      cache.set('x', 10);
      cache.set('y', 20);
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      const cache = createLRUCache({ max: 10, maxAge: 60000 });
      expect(cache.size()).toBe(0);
    });

    it('should count only non-expired entries', () => {
      jest.useFakeTimers();
      const cache = createLRUCache({ max: 10, maxAge: 1000 });
      cache.set('a', 1);
      cache.set('b', 2);
      jest.advanceTimersByTime(1001); // a and b are expired
      cache.set('c', 3);
      expect(cache.size()).toBe(1); // only 'c' is valid
      jest.useRealTimers();
    });

    it('should not exceed max', () => {
      const cache = createLRUCache({ max: 3, maxAge: 60000 });
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, i);
      }
      expect(cache.size()).toBe(3);
    });
  });

  describe('stats', () => {
    it('should return correct size, max and maxAge', () => {
      const cache = createLRUCache({ max: 5, maxAge: 3000 });
      cache.set('a', 1);
      cache.set('b', 2);
      const result = cache.stats();
      expect(result.size).toBe(2);
      expect(result.max).toBe(5);
      expect(result.maxAge).toBe(3000);
    });

    it('should report expiredCount correctly', () => {
      jest.useFakeTimers();
      const cache = createLRUCache({ max: 10, maxAge: 1000 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      jest.advanceTimersByTime(1001); // all three expire
      
      // At this point, entries are expired but haven't been evicted yet
      const result = cache.stats();
      expect(result.expiredCount).toBe(3);
      expect(result.size).toBe(0); // size() only counts non-expired
      
      cache.set('d', 4); // this triggers eviction of a, b, c
      const resultAfterSet = cache.stats();
      expect(resultAfterSet.expiredCount).toBe(0);
      expect(resultAfterSet.size).toBe(1); // only d is valid
      
      jest.useRealTimers();
    });
  });

});
