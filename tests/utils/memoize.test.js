'use strict';
/* global jest, setTimeout */

const { memoize, memoizeAsync, memoizeWithLimit } = require('../../src/utils/memoize');

describe('memoize', () => {
  it('should return the correct result on first call', () => {
    const fn = jest.fn((x, y) => x + y);
    const memoized = memoize(fn);
    expect(memoized(2, 3)).toBe(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should return cached result on second call with same args', () => {
    const fn = jest.fn((x, y) => x + y);
    const memoized = memoize(fn);
    memoized(2, 3);
    const result = memoized(2, 3);
    expect(result).toBe(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the original function only once for same args', () => {
    const fn = jest.fn((x) => x * 2);
    const memoized = memoize(fn);
    memoized(5);
    memoized(5);
    memoized(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should recompute for different arguments', () => {
    const fn = jest.fn((x) => x * 2);
    const memoized = memoize(fn);
    memoized(5);
    memoized(6);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple argument types correctly', () => {
    const fn = jest.fn((a, b, c) => `${a}-${b}-${c}`);
    const memoized = memoize(fn);
    expect(memoized('a', 1, true)).toBe('a-1-true');
    expect(memoized('a', 1, true)).toBe('a-1-true');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle object arguments by value via JSON.stringify', () => {
    const fn = jest.fn((obj) => obj.val * 2);
    const memoized = memoize(fn);
    expect(memoized({ val: 3 })).toBe(6);
    expect(memoized({ val: 3 })).toBe(6);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should expose a .cache property that is a Map', () => {
    const fn = jest.fn();
    const memoized = memoize(fn);
    expect(memoized.cache).toBeInstanceOf(Map);
  });

  it('should store results in the cache after first call', () => {
    const fn = jest.fn((x) => x + 1);
    const memoized = memoize(fn);
    memoized(10);
    expect(memoized.cache.has(JSON.stringify([10]))).toBe(true);
    expect(memoized.cache.get(JSON.stringify([10]))).toBe(11);
  });

  it('should work with functions returning objects', () => {
    const fn = jest.fn((x) => ({ result: x }));
    const memoized = memoize(fn);
    const res1 = memoized(5);
    const res2 = memoized(5);
    expect(res1).toEqual({ result: 5 });
    expect(res2).toEqual({ result: 5 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work with functions returning arrays', () => {
    const fn = jest.fn((x) => [x, x]);
    const memoized = memoize(fn);
    const res1 = memoized(5);
    const res2 = memoized(5);
    expect(res1).toEqual([5, 5]);
    expect(res2).toEqual([5, 5]);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('memoizeAsync', () => {
  it('should resolve with the correct result on first call', async () => {
    const fn = jest.fn(async (x) => x * 2);
    const memoized = memoizeAsync(fn);
    const result = await memoized(5);
    expect(result).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should return cached result on second call', async () => {
    const fn = jest.fn(async (x) => x * 2);
    const memoized = memoizeAsync(fn);
    await memoized(5);
    const result = await memoized(5);
    expect(result).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should call the original async function only once', async () => {
    const fn = jest.fn(async (x) => x * 2);
    const memoized = memoizeAsync(fn);
    await memoized(5);
    await memoized(5);
    await memoized(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should remove rejected promise from cache', async () => {
    let callCount = 0;
    const failingFn = jest.fn(async () => {
      callCount++;
      if (callCount === 1) throw new Error('transient error');
      return 'success';
    });
    const memoized = memoizeAsync(failingFn);

    await expect(memoized('key')).rejects.toThrow('transient error');
    // Cache should be empty after rejection
    expect(memoized.cache.size).toBe(0);
  });

  it('should allow retry after a rejection', async () => {
    let callCount = 0;
    const failingFn = jest.fn(async () => {
      callCount++;
      if (callCount === 1) throw new Error('transient error');
      return 'success';
    });
    const memoized = memoizeAsync(failingFn);

    await expect(memoized('key')).rejects.toThrow('transient error');
    // Cache should be empty after rejection
    expect(memoized.cache.size).toBe(0);
    // Second call should succeed
    const result = await memoized('key');
    expect(result).toBe('success');
    expect(failingFn).toHaveBeenCalledTimes(2);
  });

  it('should expose a .cache property', () => {
    const fn = jest.fn(async () => {});
    const memoized = memoizeAsync(fn);
    expect(memoized.cache).toBeInstanceOf(Map);
  });

  it('should handle concurrent calls with same args', async () => {
    const fn = jest.fn(async (x) => {
      await new Promise((r) => setTimeout(r, 10));
      return x * 2;
    });
    const memoized = memoizeAsync(fn);

    // Call concurrently — fn should only execute once
    const [r1, r2, r3] = await Promise.all([
      memoized(5), memoized(5), memoized(5)
    ]);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(r1).toBe(10);
    expect(r2).toBe(10);
    expect(r3).toBe(10);
  });
});

describe('memoizeWithLimit', () => {
  it('should return correct result on first call', () => {
    const fn = jest.fn((x) => x * 2);
    const memoized = memoizeWithLimit(fn, 2);
    expect(memoized(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should return cached result within limit', () => {
    const fn = jest.fn((x) => x * 2);
    const memoized = memoizeWithLimit(fn, 2);
    memoized(5);
    expect(memoized(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should evict oldest entry when limit is reached', () => {
    const fn = jest.fn((x) => x * 2);
    const memoized = memoizeWithLimit(fn, 2);

    memoized(1); // cache: {1}
    memoized(2); // cache: {1, 2}
    memoized(3); // cache: {2, 3} — 1 evicted (oldest)

    expect(memoized.cache.size).toBe(2);
    expect(memoized.cache.has(JSON.stringify([1]))).toBe(false);
    expect(memoized.cache.has(JSON.stringify([2]))).toBe(true);
    expect(memoized.cache.has(JSON.stringify([3]))).toBe(true);
  });

  it('should recompute evicted entries', () => {
    const fn = jest.fn((x) => x * 2);
    const memoized = memoizeWithLimit(fn, 2);

    memoized(1);
    memoized(2);
    memoized(3); // evicts 1
    memoized(1); // recomputes 1, evicts 2

    expect(fn).toHaveBeenCalledTimes(4); // 1, 2, 3, 1
    expect(memoized.cache.has(JSON.stringify([2]))).toBe(false);
    expect(memoized.cache.has(JSON.stringify([3]))).toBe(true);
    expect(memoized.cache.has(JSON.stringify([1]))).toBe(true);
  });

  it('should throw if maxSize is not a positive integer', () => {
    const fn = jest.fn();
    expect(() => memoizeWithLimit(fn, '5')).toThrow('memoizeWithLimit: maxSize must be a positive integer.');
  });

  it('should throw if maxSize is zero', () => {
    const fn = jest.fn();
    expect(() => memoizeWithLimit(fn, 0)).toThrow('memoizeWithLimit: maxSize must be a positive integer.');
  });

  it('should throw if maxSize is negative', () => {
    const fn = jest.fn();
    expect(() => memoizeWithLimit(fn, -5)).toThrow('memoizeWithLimit: maxSize must be a positive integer.');
  });

  it('should throw if maxSize is a float', () => {
    const fn = jest.fn();
    expect(() => memoizeWithLimit(fn, 2.5)).toThrow('memoizeWithLimit: maxSize must be a positive integer.');
  });

  it('should expose a .cache property', () => {
    const fn = jest.fn();
    const memoized = memoizeWithLimit(fn, 2);
    expect(memoized.cache).toBeInstanceOf(Map);
  });

  it('should never exceed maxSize entries in cache', () => {
    const fn = jest.fn((x) => x);
    const memoized = memoizeWithLimit(fn, 3);
    for (let i = 0; i < 10; i++) {
      memoized(i);
    }
    expect(memoized.cache.size).toBe(3);
  });
});
