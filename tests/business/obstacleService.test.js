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
        mapId: 1,
        position: { x: 10, y: 15 },
        size: 5
      };

      const mockDbResponse = {
        id: 1,
        mapId: 1,
        positionX: 10,
        positionY: 15,
        size: 5,
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z',
        toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue({ id: 1 });
      obstacleRepository.createObstacle.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.createObstacleService(input);

      expect(mapRepository.getMapById).toHaveBeenCalledWith(1);
      expect(obstacleRepository.createObstacle).toHaveBeenCalledWith({
        mapId: 1,
        positionX: 10,
        positionY: 15,
        size: 5
      });
      expect(result.id).toBe(1);
      expect(result.position.x).toBe(10);
    });

    it('should throw NOT_FOUND error if map does not exist', async () => {
      const input = {
        mapId: 999,
        position: { x: 10, y: 15 },
        size: 5
      };
      
      mapRepository.getMapById.mockResolvedValue(null);

      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });

    it('should throw VALIDATION_ERROR if position is invalid', async () => {
      const input = {
        mapId: 1,
        position: { x: -10, y: 15 },
        size: 5
      };
      mapRepository.getMapById.mockResolvedValue({ id: 1 });
      await expect(obstacleService.createObstacleService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
    });
  });

  describe('getObstacleService', () => {
    it('should return an obstacle when found', async () => {
      const mockDbResponse = {
        id: 1,
        mapId: 1,
        positionX: 10,
        positionY: 15,
        size: 5,
        toJSON: function() { return this; }
      };

      obstacleRepository.getObstacleById.mockResolvedValue(mockDbResponse);

      const result = await obstacleService.getObstacleService(1);
      expect(result.id).toBe(1);
      expect(result.position.x).toBe(10);
    });

    it('should throw NOT_FOUND error when obstacle does not exist', async () => {
      obstacleRepository.getObstacleById.mockResolvedValue(null);
      await expect(obstacleService.getObstacleService(999)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('getAllObstaclesService', () => {
    it('should pass parsed mapId to repository', async () => {
      obstacleRepository.getAllObstacles.mockResolvedValue([]);
      await obstacleService.getAllObstaclesService('123');
      expect(obstacleRepository.getAllObstacles).toHaveBeenCalledWith(123);
    });
  });

  describe('updateObstacleService', () => {
    it('should update an obstacle when valid and existing', async () => {
      const existingObstacle = { id: 1, mapId: 1, positionX: 5, positionY: 5, size: 2 };
      const updateData = { mapId: 1, position: { x: 10, y: 10 }, size: 3 };
      const updatedMock = {
        id: 1, mapId: 1, positionX: 10, positionY: 10, size: 3, toJSON: function() { return this; }
      };

      obstacleRepository.getObstacleById.mockResolvedValue(existingObstacle);
      mapRepository.getMapById.mockResolvedValue({ id: 1 });
      obstacleRepository.updateObstacle.mockResolvedValue(updatedMock);

      const result = await obstacleService.updateObstacleService(1, updateData);

      expect(obstacleRepository.updateObstacle).toHaveBeenCalledWith(1, {
        mapId: 1, positionX: 10, positionY: 10, size: 3
      });
      expect(result.size).toBe(3);
    });

    it('should throw NOT_FOUND if updating non-existent obstacle', async () => {
      obstacleRepository.getObstacleById.mockResolvedValue(null);
      await expect(obstacleService.updateObstacleService(999, {})).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
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
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });
});
