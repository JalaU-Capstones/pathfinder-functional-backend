
jest.mock('../../../src/presentation/middlewares/authMiddleware', () => ({
  authMiddleware: (req, _res, next) => {
    req.user = { userId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
    next();
  },
  extractToken: jest.fn(),
  verifyToken: jest.fn()
}));
/* global jest, beforeEach */
'use strict';

jest.mock('../../../src/business/services/statsService', () => ({
  getRequestStats: jest.fn(),
  getResponseTimeStats: jest.fn(),
  getStatusCodeStats: jest.fn(),
  getPopularEndpoints: jest.fn(),
}));

const request = require('supertest');
const app = require('../../../src/app');
const statsService =
  require('../../../src/business/services/statsService');

describe('statsController', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /stats/requests', () => {
    it('should return 200 with request stats', async () => {
      const mockData = {
        total_requests: 10,
        breakdown: { '/api/maps': { GET: 10 } },
      };
      statsService.getRequestStats.mockResolvedValue(mockData);

      const { createApp } = app;
      const res = await request(createApp()).get('/stats/requests');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total_requests).toBe(10);
    });

    it('should return 500 on service error', async () => {
      statsService.getRequestStats.mockRejectedValue(
        new Error('DB error')
      );
      const { createApp } = app;
      const res = await request(createApp()).get('/stats/requests');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /stats/response-times', () => {
    it('should return 200 with timing stats', async () => {
      statsService.getResponseTimeStats.mockResolvedValue(
        { '/api/maps': { avg: 45, min: 10, max: 200 } }
      );
      const { createApp } = app;
      const res =
        await request(createApp()).get('/stats/response-times');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /stats/status-codes', () => {
    it('should return 200 with status code counts', async () => {
      statsService.getStatusCodeStats.mockResolvedValue(
        { 200: 80, 404: 5 }
      );
      const { createApp } = app;
      const res =
        await request(createApp()).get('/stats/status-codes');
      expect(res.status).toBe(200);
      expect(res.body.data[200]).toBe(80);
    });
  });

  describe('GET /stats/popular-endpoints', () => {
    it('should return 200 with ranked endpoints', async () => {
      statsService.getPopularEndpoints.mockResolvedValue({
        most_popular: '/api/maps',
        request_count: 80,
        ranked: [{ endpoint: '/api/maps', request_count: 80 }],
      });
      const { createApp } = app;
      const res =
        await request(createApp()).get('/stats/popular-endpoints');
      expect(res.status).toBe(200);
      expect(res.body.data.most_popular).toBe('/api/maps');
    });
  });
});
