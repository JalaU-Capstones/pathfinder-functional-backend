'use strict';

const {
  runParallel,
  runParallelSettled,
  validateAll,
} = require('../../../src/utils/concurrency');
const { ERROR_TYPES } = require('../../../src/utils/errors');

describe('concurrency utilities', () => {
  // ─── runParallel ─────────────────────────────────────────────────────────────

  describe('runParallel', () => {
    it('should resolve with an array of all results when all thunks succeed', async () => {
      const results = await runParallel([
        () => Promise.resolve(1),
        () => Promise.resolve(2),
        () => Promise.resolve(3),
      ]);
      expect(results).toEqual([1, 2, 3]);
    });

    it('should reject immediately if any thunk rejects (fail-fast)', async () => {
      const error = new Error('thunk-2 failed');
      await expect(
        runParallel([
          () => Promise.resolve('ok'),
          () => Promise.reject(error),
          () => Promise.resolve('also ok'),
        ])
      ).rejects.toThrow('thunk-2 failed');
    });

    it('should resolve with an empty array when given an empty list', async () => {
      const results = await runParallel([]);
      expect(results).toEqual([]);
    });

    it('should resolve with a single result when given one thunk', async () => {
      const results = await runParallel([() => Promise.resolve('only')]);
      expect(results).toEqual(['only']);
    });

    it('should call every thunk', async () => {
      const calls = [];
      await runParallel([
        () => { calls.push(1); return Promise.resolve(); },
        () => { calls.push(2); return Promise.resolve(); },
      ]);
      expect(calls).toContain(1);
      expect(calls).toContain(2);
    });
  });

  // ─── runParallelSettled ───────────────────────────────────────────────────────

  describe('runParallelSettled', () => {
    it('should return all passed results when all succeed', async () => {
      const { passed, failed } = await runParallelSettled([
        () => Promise.resolve('a'),
        () => Promise.resolve('b'),
      ]);
      expect(passed).toEqual(['a', 'b']);
      expect(failed).toEqual([]);
    });

    it('should NOT reject when some thunks fail — collects all results', async () => {
      const error = new Error('oops');
      const { passed, failed } = await runParallelSettled([
        () => Promise.resolve('ok'),
        () => Promise.reject(error),
      ]);
      expect(passed).toEqual(['ok']);
      expect(failed).toHaveLength(1);
      expect(failed[0].message).toBe('oops');
    });

    it('should return all failed when every thunk rejects', async () => {
      const { passed, failed } = await runParallelSettled([
        () => Promise.reject(new Error('err1')),
        () => Promise.reject(new Error('err2')),
      ]);
      expect(passed).toEqual([]);
      expect(failed).toHaveLength(2);
      expect(failed.map((e) => e.message)).toContain('err1');
      expect(failed.map((e) => e.message)).toContain('err2');
    });

    it('should return empty passed and failed for an empty list', async () => {
      const { passed, failed } = await runParallelSettled([]);
      expect(passed).toEqual([]);
      expect(failed).toEqual([]);
    });

    it('should preserve the error objects in failed', async () => {
      const appError = { isAppError: true, type: 'VALIDATION_ERROR', message: 'bad' };
      const { failed } = await runParallelSettled([
        () => Promise.reject(appError),
      ]);
      expect(failed[0]).toEqual(appError);
    });
  });

  // ─── validateAll ─────────────────────────────────────────────────────────────

  describe('validateAll', () => {
    it('should resolve without error when all validations pass', async () => {
      await expect(
        validateAll([
          () => Promise.resolve('check1 ok'),
          () => Promise.resolve('check2 ok'),
        ])
      ).resolves.toBeUndefined();
    });

    it('should throw a VALIDATION_ERROR when one validation fails', async () => {
      const err = { message: 'field X is required', type: ERROR_TYPES.VALIDATION_ERROR };
      await expect(
        validateAll([
          () => Promise.resolve('ok'),
          () => Promise.reject(err),
        ])
      ).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should combine ALL failure messages when multiple validations fail', async () => {
      const err1 = { message: 'problem A', type: ERROR_TYPES.VALIDATION_ERROR };
      const err2 = { message: 'problem B', type: ERROR_TYPES.VALIDATION_ERROR };
      await expect(
        validateAll([
          () => Promise.reject(err1),
          () => Promise.reject(err2),
        ])
      ).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: expect.stringContaining('problem A'),
      });
      await expect(
        validateAll([
          () => Promise.reject(err1),
          () => Promise.reject(err2),
        ])
      ).rejects.toMatchObject({
        message: expect.stringContaining('problem B'),
      });
    });

    it('should pass even when some thunks resolve to falsy values', async () => {
      await expect(
        validateAll([
          () => Promise.resolve(null),
          () => Promise.resolve(0),
          () => Promise.resolve(false),
        ])
      ).resolves.toBeUndefined();
    });
  });
});
