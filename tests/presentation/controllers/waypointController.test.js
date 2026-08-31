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

const waypointService = require('../../../src/business/services/waypointService');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/business/services/waypointService', () => ({
  createWaypointService: jest.fn(),
  getWaypointService: jest.fn(),
  getAllWaypointsService: jest.fn(),
  updateWaypointService: jest.fn(),
  deleteWaypointService: jest.fn(),
}));

describe('Waypoint Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/waypoints', () => {
    it('should return 201 and created waypoint on success', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      waypointService.createWaypointService.mockResolvedValue(mockObj);

      const response = await request(app).post('/api/waypoints').send({ mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 400 on validation error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid data');
      waypointService.createWaypointService.mockRejectedValue(error);

      const response = await request(app).post('/api/waypoints').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 404 on map not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Map not found');
      waypointService.createWaypointService.mockRejectedValue(error);

      const response = await request(app).post('/api/waypoints').send({});

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/waypoints', () => {
    it('should return 200 and array of waypoints', async () => {
      const mockObjs = [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }];
      waypointService.getAllWaypointsService.mockResolvedValue(mockObjs);

      const response = await request(app).get('/api/waypoints');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObjs);
    });

    it('should return 500 on unexpected error', async () => {
      const error = createAppError(ERROR_TYPES.INTERNAL_ERROR, 'Internal error');
      waypointService.getAllWaypointsService.mockRejectedValue(error);

      const response = await request(app).get('/api/waypoints');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/waypoints/:id', () => {
    it('should return 200 and waypoint', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      waypointService.getWaypointService.mockResolvedValue(mockObj);

      const response = await request(app).get('/api/waypoints/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      waypointService.getWaypointService.mockRejectedValue(error);

      const response = await request(app).get('/api/waypoints/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/waypoints/:id', () => {
    it('should return 200 and updated waypoint', async () => {
      const mockObj = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      waypointService.updateWaypointService.mockResolvedValue(mockObj);

      const response = await request(app).put('/api/waypoints/3b47e69f-788d-4b19-b81b-0b4a2fd92799').send({});

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      waypointService.updateWaypointService.mockRejectedValue(error);

      const response = await request(app).put('/api/waypoints/99999999-9999-9999-9999-999999999999').send({});

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/waypoints/:id', () => {
    it('should return 204 on success', async () => {
      waypointService.deleteWaypointService.mockResolvedValue(true);

      const response = await request(app).delete('/api/waypoints/3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(response.status).toBe(204);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      waypointService.deleteWaypointService.mockRejectedValue(error);

      const response = await request(app).delete('/api/waypoints/99999999-9999-9999-9999-999999999999');

      expect(response.status).toBe(404);
    });
  });
});
