/* global jest, beforeEach */
const obstacleRepository = require('../../src/data/repositories/obstacleRepository');
const mapRepository = require('../../src/data/repositories/mapRepository');
const obstacleService = require('../../src/business/services/obstacleService');
const { ERROR_TYPES } = require('../../src/utils/errors');

jest.mock('../../src/data/repositories/obstacleRepository');
jest.mock('../../src/data/repositories/mapRepository');

describe('Obstacle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createObstacleService', () => {
    it('should create an obstacle when input is valid', async () => {
      const input = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        position: { x: 10, y: 15 },
        size: 5
      };

      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        positionX: 10,
        positionY: 15,
        size: 5,
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z',
        toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      obstacleRepository.createObstacle.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.createObstacleService(input);

      expect(mapRepository.getMapById).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799', { userId: undefined });
      expect(obstacleRepository.createObstacle).toHaveBeenCalledWith({
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        positionX: 10,
        positionY: 15,
        size: 5,
        userId: undefined
      });
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.position.x).toBe(10);
    });

    it('should throw NOT_FOUND error if map does not exist', async () => {
      const input = {
        mapId: '99999999-9999-9999-9999-999999999999',
        position: { x: 10, y: 15 },
        size: 5
      };
      
      mapRepository.getMapById.mockResolvedValue(null);

      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });

    it('should throw VALIDATION_ERROR if position x is invalid', async () => {
      const input = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        position: { x: -10, y: 15 },
        size: 5
      };
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Position x must be a non-negative integer.'
      });
    });

    it('should throw VALIDATION_ERROR if mapId is missing or invalid', async () => {
      await expect(obstacleService.createObstacleService({ position: { x: 10, y: 15 }, size: 5 })).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'mapId is required and must be a string.'
      });
    });

    it('should throw VALIDATION_ERROR if position object is missing', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService({ mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', size: 5 })).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Position object is required.'
      });
    });

    it('should throw VALIDATION_ERROR if position y is invalid', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService({ mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: 10, y: -15 }, size: 5 })).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Position y must be a non-negative integer.'
      });
    });

    it('should throw VALIDATION_ERROR if size is missing or invalid', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService({ mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: 10, y: 15 }, size: -5 })).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Size must be a positive integer.'
      });
    });
  });

  describe('getObstacleService', () => {
    it('should return an obstacle when found', async () => {
      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        positionX: 10,
        positionY: 15,
        size: 5,
        toJSON: function() { return this; }
      };

      obstacleRepository.getObstacleById.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.getObstacleService(1);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.position.x).toBe(10);
    });

    it('should throw NOT_FOUND error when obstacle does not exist', async () => {
      obstacleRepository.getObstacleById.mockResolvedValue(null);
      await expect(obstacleService.getObstacleService(999)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });

  describe('getAllObstaclesService', () => {
    it('should pass parsed mapId to repository', async () => {
      obstacleRepository.getAllObstacles.mockResolvedValue([]);
      await obstacleService.getAllObstaclesService('123');
      expect(obstacleRepository.getAllObstacles).toHaveBeenCalledWith('123', { userId: undefined });
    });

    it('should pass null to repository if mapId is omitted', async () => {
      obstacleRepository.getAllObstacles.mockResolvedValue([]);
      await obstacleService.getAllObstaclesService();
      expect(obstacleRepository.getAllObstacles).toHaveBeenCalledWith(null, { userId: undefined });
    });
  });

  describe('toApiShape', () => {
    it('should return null if input is falsy', () => {
      expect(obstacleService.toApiShape(null)).toBeNull();
    });

    it('should handle input without toJSON method', () => {
      const input = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', positionX: 10, positionY: 10, size: 5 };
      const result = obstacleService.toApiShape(input);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.position).toEqual({ x: 10, y: 10 });
    });
  });

  describe('updateObstacleService', () => {
    it('should update an obstacle when valid and existing', async () => {
      const existingObstacle = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', positionX: 5, positionY: 5, size: 2 };
      const updateData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: 10, y: 10 }, size: 3 };
      const updatedMock = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', positionX: 10, positionY: 10, size: 3, toJSON: function() { return this; }
      };

      obstacleRepository.getObstacleById.mockResolvedValue(existingObstacle);
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      obstacleRepository.updateObstacle.mockResolvedValue(updatedMock);

      const result = await obstacleService.updateObstacleService(1, updateData);

      expect(obstacleRepository.updateObstacle).toHaveBeenCalledWith(1, {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', positionX: 10, positionY: 10, size: 3
      }, { userId: undefined });
      expect(result.size).toBe(3);
    });

    it('should throw NOT_FOUND if updating non-existent obstacle', async () => {
      obstacleRepository.getObstacleById.mockResolvedValue(null);
      await expect(obstacleService.updateObstacleService(999, {})).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });

  describe('deleteObstacleService', () => {
    it('should return true if obstacle deleted', async () => {
      obstacleRepository.deleteObstacle.mockResolvedValue(true);
      const result = await obstacleService.deleteObstacleService(1);
      expect(result).toBe(true);
    });

    it('should throw NOT_FOUND if obstacle not deleted', async () => {
      obstacleRepository.deleteObstacle.mockResolvedValue(false);
      await expect(obstacleService.deleteObstacleService(999)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });
});
