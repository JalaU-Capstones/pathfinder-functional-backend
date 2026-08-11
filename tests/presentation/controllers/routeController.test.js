/* global jest, beforeEach */
const request = require('supertest');
const { createApp } = require('../../../src/app');
const app = createApp();
const routeService = require('../../../src/business/services/routeService');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/business/services/routeService', () => ({
  createRouteService: jest.fn(),
  getRouteService: jest.fn(),
  getAllRoutesService: jest.fn(),
  deleteRouteService: jest.fn(),
}));

describe('Route Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/routes', () => {
    it('should return 201 and created route on success', async () => {
      const mockObj = { distance: 10, optimal_path: [] };
      routeService.createRouteService.mockResolvedValue(mockObj);

      const response = await request(app).post('/api/routes').send({ mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 400 on validation error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid');
      routeService.createRouteService.mockRejectedValue(error);

      const response = await request(app).post('/api/routes').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
    });

    it('should return 404 on map not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Map not found');
      routeService.createRouteService.mockRejectedValue(error);

      const response = await request(app).post('/api/routes').send({});

      expect(response.status).toBe(404);
    });
    
    it('should return 422 on waypoint compliance failure', async () => {
      const error = createAppError(ERROR_TYPES.UNPROCESSABLE_ENTITY, 'Unreachable');
      routeService.createRouteService.mockRejectedValue(error);

      const response = await request(app).post('/api/routes').send({});

      expect(response.status).toBe(422);
    });
  });

  describe('GET /api/routes', () => {
    it('should return 200 and array of routes', async () => {
      const mockObjs = [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }];
      routeService.getAllRoutesService.mockResolvedValue(mockObjs);

      const response = await request(app).get('/api/routes');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObjs);
    });

    it('should return 200 and empty array', async () => {
      routeService.getAllRoutesService.mockResolvedValue([]);

      const response = await request(app).get('/api/routes');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 500 on unexpected error', async () => {
      const error = createAppError(ERROR_TYPES.INTERNAL_ERROR, 'Internal error');
      routeService.getAllRoutesService.mockRejectedValue(error);

      const response = await request(app).get('/api/routes');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/routes/:id', () => {
    it('should return 200 and route', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      routeService.getRouteService.mockResolvedValue(mockObj);

      const response = await request(app).get('/api/routes/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      routeService.getRouteService.mockRejectedValue(error);

      const response = await request(app).get('/api/routes/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/routes/:id', () => {
    it('should return 204 on success', async () => {
      routeService.deleteRouteService.mockResolvedValue(true);

      const response = await request(app).delete('/api/routes/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(204);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      routeService.deleteRouteService.mockRejectedValue(error);

      const response = await request(app).delete('/api/routes/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });
});
