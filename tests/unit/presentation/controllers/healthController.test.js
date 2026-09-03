const request = require('supertest');
const { createApp } = require('../../../../src/app');
const app = createApp();

describe('Health Controller', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
