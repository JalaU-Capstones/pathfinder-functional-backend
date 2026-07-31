/* global jest, beforeEach */
const request = require('supertest');
const { createApp } = require('../../../src/app');
const app = createApp();
const obstacleService = require('../../../src/business/services/obstacleService');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/business/services/obstacleService', () => ({
  createObstacleService: jest.fn(),
  getObstacleService: jest.fn(),
  getAllObstaclesService: jest.fn(),
  updateObstacleService: jest.fn(),
  deleteObstacleService: jest.fn(),
}));

describe('Obstacle Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/obstacles', () => {
    it('should return 201 and created obstacle on success', async () => {
      const mockObj = { id: 1, mapId: 1 };
      obstacleService.createObstacleService.mockResolvedValue(mockObj);

      const response = await request(app).post('/api/obstacles').send({ mapId: 1 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 400 on validation error', async () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid data');
      obstacleService.createObstacleService.mockRejectedValue(error);

      const response = await request(app).post('/api/obstacles').send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 404 on map not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Map not found');
      obstacleService.createObstacleService.mockRejectedValue(error);

      const response = await request(app).post('/api/obstacles').send({});

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/obstacles', () => {
    it('should return 200 and array of obstacles', async () => {
      const mockObjs = [{ id: 1 }];
      obstacleService.getAllObstaclesService.mockResolvedValue(mockObjs);

      const response = await request(app).get('/api/obstacles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockObjs);
    });

    it('should return 200 with mapId filter', async () => {
      obstacleService.getAllObstaclesService.mockResolvedValue([]);

      const response = await request(app).get('/api/obstacles?mapId=1');

      expect(response.status).toBe(200);
      expect(obstacleService.getAllObstaclesService).toHaveBeenCalledWith('1');
    });
  });

  describe('GET /api/obstacles/:id', () => {
    it('should return 200 and obstacle', async () => {
      const mockObj = { id: 1 };
      obstacleService.getObstacleService.mockResolvedValue(mockObj);

      const response = await request(app).get('/api/obstacles/1');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      obstacleService.getObstacleService.mockRejectedValue(error);

      const response = await request(app).get('/api/obstacles/999');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/obstacles/:id', () => {
    it('should return 200 and updated obstacle', async () => {
      const mockObj = { id: 1, size: 2 };
      obstacleService.updateObstacleService.mockResolvedValue(mockObj);

      const response = await request(app).put('/api/obstacles/1').send({ size: 2 });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockObj);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      obstacleService.updateObstacleService.mockRejectedValue(error);

      const response = await request(app).put('/api/obstacles/999').send({});

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/obstacles/:id', () => {
    it('should return 204 on success', async () => {
      obstacleService.deleteObstacleService.mockResolvedValue(true);

      const response = await request(app).delete('/api/obstacles/1');

      expect(response.status).toBe(204);
    });

    it('should return 404 on not found', async () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found');
      obstacleService.deleteObstacleService.mockRejectedValue(error);

      const response = await request(app).delete('/api/obstacles/999');

      expect(response.status).toBe(404);
    });
  });
});
