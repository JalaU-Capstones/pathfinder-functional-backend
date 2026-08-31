/* global jest, beforeEach */
const obstacleRepository = require('../../src/data/repositories/obstacleRepository');
const { Obstacle } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    Obstacle: {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    }
  };
});

describe('Obstacle Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createObstacle', () => {
    it('should call Obstacle.create', async () => {
      const data = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', positionX: 10, positionY: 15, size: 5 };
      Obstacle.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data });

      const result = await obstacleRepository.createObstacle(data);
      expect(Obstacle.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('getObstacleById', () => {
    it('should call Obstacle.findOne', async () => {
      Obstacle.findOne.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      const result = await obstacleRepository.getObstacleById('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(Obstacle.findOne).toHaveBeenCalledWith({ where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } });
      expect(result.mapId).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('getAllObstacles', () => {
    it('should call Obstacle.findAll without filter', async () => {
      Obstacle.findAll.mockResolvedValue([]);
      await obstacleRepository.getAllObstacles();
      expect(Obstacle.findAll).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
    });

    it('should call Obstacle.findAll with mapId filter', async () => {
      Obstacle.findAll.mockResolvedValue([]);
      await obstacleRepository.getAllObstacles('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(Obstacle.findAll).toHaveBeenCalledWith({ 
        order: [['createdAt', 'DESC']],
        where: { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }
      });
    });
  });

  describe('updateObstacle', () => {
    it('should call Obstacle.update and return updated row', async () => {
      const data = { size: 10 };
      Obstacle.update.mockResolvedValue([1, [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data }]]);
      const result = await obstacleRepository.updateObstacle('3b47e69f-788d-4b19-b81b-0b4a2fd92799', data);
      expect(Obstacle.update).toHaveBeenCalledWith(data, { where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }, returning: true });
      expect(result.size).toBe(10);
    });

    it('should return null if no rows updated', async () => {
      Obstacle.update.mockResolvedValue([0, []]);
      const result = await obstacleRepository.updateObstacle('99999999-9999-9999-9999-999999999999', {});
      expect(result).toBeNull();
    });
  });

  describe('deleteObstacle', () => {
    it('should call Obstacle.destroy and return true if deleted', async () => {
      Obstacle.destroy.mockResolvedValue(1);
      const result = await obstacleRepository.deleteObstacle('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(Obstacle.destroy).toHaveBeenCalledWith({ where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      Obstacle.destroy.mockResolvedValue(0);
      const result = await obstacleRepository.deleteObstacle('99999999-9999-9999-9999-999999999999');
      expect(result).toBe(false);
    });
  });
});
