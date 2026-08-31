/* global jest, beforeEach */
const request = require('supertest');
const { createApp } = require('../../../src/app');
const app = createApp();


jest.mock('../../../src/presentation/middlewares/authMiddleware', () => ({
  authMiddleware: (req, _res, next) => {
    req.user = { userId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
    next();
  },
  extractToken: jest.fn(),
  verifyToken: jest.fn()
}));

const mapService = require('../../../src/business/services/mapService');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/business/services/mapService', () => ({
  createMapService: jest.fn(),
  getMapService: jest.fn(),
  getAllMapsService: jest.fn(),
  updateMapService: jest.fn(),
  deleteMapService: jest.fn(),
}));

describe('Map Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/maps', () => {
    it('should return 201 and created map on success', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Test Map' };
      mapService.createMapService.mockResolvedValue(mockMap);

      const response = await request(app).post('/api/maps').send({ name: 'Test Map' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMap);
    });

    it('should return 400 on validation error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid data');
      mapService.createMapService.mockRejectedValue(error);

      const response = await request(app).post('/api/maps').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 404 on not found error', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Map not found');
      mapService.createMapService.mockRejectedValue(error);

      const response = await request(app).post('/api/maps').send({});

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 on unexpected error', async () => {
      const error = createAppError(ERROR_TYPES.INTERNAL_ERROR, 'Internal error');
      mapService.createMapService.mockRejectedValue(error);

      const response = await request(app).post('/api/maps').send({});

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/maps', () => {
    it('should return 200 and array of maps', async () => {
      const mockMaps = [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Map 1' }];
      mapService.getAllMapsService.mockResolvedValue(mockMaps);

      const response = await request(app).get('/api/maps');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMaps);
    });

    it('should return 200 and empty array', async () => {
      mapService.getAllMapsService.mockResolvedValue([]);

      const response = await request(app).get('/api/maps');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 500 on unexpected error', async () => {
      const error = createAppError(ERROR_TYPES.INTERNAL_ERROR, 'Internal error');
      mapService.getAllMapsService.mockRejectedValue(error);

      const response = await request(app).get('/api/maps');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/maps/:id', () => {
    it('should return 200 and map', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Map 1' };
      mapService.getMapService.mockResolvedValue(mockMap);

      const response = await request(app).get('/api/maps/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMap);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      mapService.getMapService.mockRejectedValue(error);

      const response = await request(app).get('/api/maps/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/maps/:id', () => {
    it('should return 200 and updated map', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Updated' };
      mapService.updateMapService.mockResolvedValue(mockMap);

      const response = await request(app).put('/api/maps/3b47e69f-788d-4b19-b81b-0b4a2fd92799').send({ name: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMap);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      mapService.updateMapService.mockRejectedValue(error);

      const response = await request(app).put('/api/maps/99999999-9999-9999-9999-999999999999').send({});

      expect(response.status).toBe(404);
    });

    it('should return 400 on validation error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid');
      mapService.updateMapService.mockRejectedValue(error);

      const response = await request(app).put('/api/maps/3b47e69f-788d-4b19-b81b-0b4a2fd92799').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/maps/:id', () => {
    it('should return 204 on success', async () => {
      mapService.deleteMapService.mockResolvedValue(true);

      const response = await request(app).delete('/api/maps/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(204);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      mapService.deleteMapService.mockRejectedValue(error);

      const response = await request(app).delete('/api/maps/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });
});
