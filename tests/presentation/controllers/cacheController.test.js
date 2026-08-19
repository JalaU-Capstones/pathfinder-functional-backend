/* global jest, beforeEach */
'use strict';

const { createCacheController } = require(
  '../../../src/presentation/controllers/cacheController'
);

jest.mock('../../../src/utils/httpResponse', () => ({
  sendSuccess: jest.fn(),
}));

const { sendSuccess } = require('../../../src/utils/httpResponse');

describe('createCacheController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCacheStats', () => {
    it('should return cache stats with status 200', () => {
      const mockStats = {
        size: 5,
        max: 50,
        maxAge: 30000,
        expiredCount: 1,
      };
      const cache = { stats: jest.fn().mockReturnValue(mockStats) };
      const { getCacheStats } = createCacheController(cache);

      const req = {};
      const res = {};
      const next = jest.fn();

      getCacheStats(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, 200, mockStats);
    });

    it('should call cache.stats()', () => {
      const cache = { stats: jest.fn().mockReturnValue({}) };
      const { getCacheStats } = createCacheController(cache);

      const req = {};
      const res = {};
      const next = jest.fn();

      getCacheStats(req, res, next);

      expect(cache.stats).toHaveBeenCalledTimes(1);
    });

    it('should forward errors to next()', () => {
      const error = new Error('Cache failure');
      const cache = {
        stats: jest.fn().mockImplementation(() => { throw error; }),
      };
      const { getCacheStats } = createCacheController(cache);

      const req = {};
      const res = {};
      const next = jest.fn();

      getCacheStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });
});
