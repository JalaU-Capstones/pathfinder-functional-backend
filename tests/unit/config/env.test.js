/* global jest, beforeEach, afterEach */

describe('env config', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should load successfully with all required variables', () => {
    const env = require('../../../src/config/env');
    expect(env).toBeDefined();
    expect(env.env.dbHost).toBe(process.env.DB_HOST || 'localhost');
  });

  it('should handle missing optional variables gracefully', () => {
    jest.mock('dotenv', () => ({ config: jest.fn() }));
    delete process.env.PORT;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    const env = require('../../../src/config/env');
    expect(env).toBeDefined();
    expect(env.env.port).toBe(3000);
    expect(env.env.dbHost).toBe('localhost');
    expect(env.env.dbPort).toBe(5432);
    expect(env.env.dbUser).toBe('pathfinder_user');
    expect(env.env.dbPassword).toBe('pathfinder_pass');
    expect(env.env.dbName).toBe('pathfinder_db');
  });

  it('should throw Error if JWT_SECRET is missing outside of test env', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';
    expect(() => require('../../../src/config/env')).toThrow('JWT_SECRET environment variable is required');
  });

  it('should use fallback if JWT_SECRET is missing in test env', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'test';
    
    const env = require('../../../src/config/env');
    
    expect(env.JWT_SECRET).toBe('TEST_SECRET_DO_NOT_USE_IN_PROD');
  });
});
