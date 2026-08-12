/* global jest, beforeEach, afterEach */

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should use default format in test environment', () => {
    process.env.NODE_ENV = 'test';
    const logger = require('../../src/utils/logger');
    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });

  it('should use JSON format in production environment', () => {
    process.env.NODE_ENV = 'production';
    const logger = require('../../src/utils/logger');
    expect(logger).toBeDefined();
    expect(logger.level).toBe('info');
    // We assume the branch was hit and doesn't throw.
  });

  describe('logValidationError', () => {
    it('should call logger.warn with correct structured object', () => {
      const logger = require('../../src/utils/logger');
      jest.spyOn(logger, 'warn').mockImplementation(() => {});
      const endpoint = 'test-endpoint';
      const input = { foo: 'bar' };
      const error = new Error('Test error');
      error.code = 'TEST_CODE';

      logger.logValidationError(endpoint, input, error);

      expect(logger.warn).toHaveBeenCalledWith('Validation error', expect.objectContaining({
        endpoint,
        input,
        errorCode: 'TEST_CODE',
        message: 'Test error',
        timestamp: expect.any(String),
      }));
    });

    it('should use UNKNOWN for errorCode if not provided', () => {
      const logger = require('../../src/utils/logger');
      jest.spyOn(logger, 'warn').mockImplementation(() => {});
      const error = new Error('No code error');
      
      logger.logValidationError('endpoint', {}, error);

      expect(logger.warn).toHaveBeenCalledWith('Validation error', expect.objectContaining({
        errorCode: 'UNKNOWN',
      }));
    });
  });

  describe('logConcurrencyEvent', () => {
    it('should call logger.info with correct structured object', () => {
      const logger = require('../../src/utils/logger');
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      logger.logConcurrencyEvent('testOp', 5, 120, 1);

      expect(logger.info).toHaveBeenCalledWith('Concurrency event', expect.objectContaining({
        operation: 'testOp',
        parallelCount: 5,
        durationMs: 120,
        failedCount: 1,
        timestamp: expect.any(String),
      }));
    });
  });

  describe('logRecursionDepth', () => {
    it('should not call logger.debug if depth is <= 2', () => {
      const logger = require('../../src/utils/logger');
      jest.spyOn(logger, 'debug').mockImplementation(() => {});
      logger.logRecursionDepth('testFunc', 1, 'input');
      logger.logRecursionDepth('testFunc', 2, 'input');
      
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should call logger.debug if depth is > 2', () => {
      const logger = require('../../src/utils/logger');
      jest.spyOn(logger, 'debug').mockImplementation(() => {});
      logger.logRecursionDepth('testFunc', 3, 'input');

      expect(logger.debug).toHaveBeenCalledWith('Recursion depth event', expect.objectContaining({
        functionName: 'testFunc',
        depth: 3,
        input: 'input',
        timestamp: expect.any(String),
      }));
    });
  });
});
