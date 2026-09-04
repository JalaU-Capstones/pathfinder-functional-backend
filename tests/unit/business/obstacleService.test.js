/* global jest, beforeEach, describe, it, expect */
const obstacleRepository = require('../../../src/data/repositories/obstacleRepository');
const mapRepository = require('../../../src/data/repositories/mapRepository');
const obstacleService = require('../../../src/business/services/obstacleService');
const { ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/data/repositories/obstacleRepository');
jest.mock('../../../src/data/repositories/mapRepository');

describe('Obstacle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createObstacleService', () => {
    it('should create a single-cell obstacle when input is valid', async () => {
      const input = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        position: { x: 10, y: 15 } // No size, no endX/Y
      };

      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 10,
        startY: 15,
        endX: 10,
        endY: 15,
        size: 1,
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
        startX: 10,
        startY: 15,
        endX: 10,
        endY: 15,
        size: 1,
        userId: undefined
      });
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.position.x).toBe(10);
      expect(result.position.y).toBe(15);
      expect(result.position.endX).toBeUndefined(); // Backward compatibility API shape
    });

    it('should create a rectangular obstacle and calculate size correctly', async () => {
      const input = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        position: { x: 5, y: 10, endX: 10, endY: 15 },
        size: 999 // User size should be ignored
      };

      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 5,
        startY: 10,
        endX: 10,
        endY: 15,
        size: 36, // (10-5+1) * (15-10+1) = 6 * 6 = 36
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z',
        toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      obstacleRepository.createObstacle.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.createObstacleService(input);

      expect(obstacleRepository.createObstacle).toHaveBeenCalledWith({
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 5,
        startY: 10,
        endX: 10,
        endY: 15,
        size: 36,
        userId: undefined
      });
      expect(result.position).toEqual({ x: 5, y: 10, endX: 10, endY: 15 });
      expect(result.size).toBe(36);
    });

    it('should default endX to x and endY to y if omitted', async () => {
      const input = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        position: { x: 5, y: 10, endX: 10 } // endY omitted
      };

      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 5,
        startY: 10,
        endX: 10,
        endY: 10,
        size: 6,
        toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      obstacleRepository.createObstacle.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.createObstacleService(input);

      expect(obstacleRepository.createObstacle).toHaveBeenCalledWith({
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 5,
        startY: 10,
        endX: 10,
        endY: 10,
        size: 6,
        userId: undefined
      });
      expect(result.size).toBe(6);
    });

    it('should throw NOT_FOUND error if map does not exist', async () => {
      const input = {
        mapId: '99999999-9999-9999-9999-999999999999',
        position: { x: 10, y: 15 }
      };
      
      mapRepository.getMapById.mockResolvedValue(null);

      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });

    it('should throw VALIDATION_ERROR if position x is negative', async () => {
      const input = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: -10, y: 15 } };
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Position x must be a non-negative integer.'
      });
    });

    it('should throw VALIDATION_ERROR if endX < x', async () => {
      const input = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: 10, y: 15, endX: 5 } };
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'endX must be an integer greater than or equal to x.'
      });
    });

    it('should throw VALIDATION_ERROR if endY < y', async () => {
      const input = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: 10, y: 15, endY: 5 } };
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'endY must be an integer greater than or equal to y.'
      });
    });
  });

  describe('getObstacleService', () => {
    it('should return an obstacle when found', async () => {
      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 10,
        startY: 15,
        endX: 10,
        endY: 15,
        size: 1,
        toJSON: function() { return this; }
      };

      obstacleRepository.getObstacleById.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.getObstacleService(1);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.position.x).toBe(10);
    });
  });

  describe('getAllObstaclesService', () => {
    it('should pass parsed mapId to repository', async () => {
      obstacleRepository.getAllObstacles.mockResolvedValue([]);
      await obstacleService.getAllObstaclesService('123');
      expect(obstacleRepository.getAllObstacles).toHaveBeenCalledWith('123', { userId: undefined });
    });
  });

  describe('toApiShape', () => {
    it('should return null if input is falsy', () => {
      expect(obstacleService.toApiShape(null)).toBeNull();
    });

    it('should handle input without toJSON method', () => {
      const input = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 10, startY: 10, endX: 10, endY: 10, size: 1 };
      const result = obstacleService.toApiShape(input);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.position).toEqual({ x: 10, y: 10 });
    });
  });

  describe('updateObstacleService', () => {
    it('should update an obstacle and normalize input', async () => {
      const existingObstacle = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 5, startY: 5, endX: 5, endY: 5, size: 1 };
      const updateData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', position: { x: 10, y: 10, endX: 12, endY: 12 } };
      const updatedMock = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 10, startY: 10, endX: 12, endY: 12, size: 9, toJSON: function() { return this; }
      };

      obstacleRepository.getObstacleById.mockResolvedValue(existingObstacle);
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      obstacleRepository.updateObstacle.mockResolvedValue(updatedMock);

      const result = await obstacleService.updateObstacleService(1, updateData);

      expect(obstacleRepository.updateObstacle).toHaveBeenCalledWith(1, {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 10, startY: 10, endX: 12, endY: 12, size: 9
      }, { userId: undefined });
      expect(result.size).toBe(9);
    });
  });

  describe('deleteObstacleService', () => {
    it('should return true if obstacle deleted', async () => {
      obstacleRepository.deleteObstacle.mockResolvedValue(true);
      const result = await obstacleService.deleteObstacleService(1);
      expect(result).toBe(true);
    });
  });
});
