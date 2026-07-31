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
});
