/* global jest, beforeEach, afterEach */
const request = require('supertest');

describe('App', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should register swagger endpoints in development', async () => {
    process.env.NODE_ENV = 'development';
    const { createApp } = require('../src/app');
    const app = createApp();

    const response = await request(app).get('/api-docs.json');
    // It should exist and return JSON or 200 depending on swaggerSpec
    // Even if swaggerSpec is empty, it shouldn't return 404.
    expect(response.status).not.toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);
  });

  it('should NOT register swagger endpoints in production', async () => {
    process.env.NODE_ENV = 'production';
    const { createApp } = require('../src/app');
    const app = createApp();

    const response = await request(app).get('/api-docs.json');
    // Since it's production, the route isn't registered, so 404 Not Found middleware will catch it
    expect(response.status).toBe(404);
  });
});
