/* global jest, beforeEach */
const obstacleRepository = require('../../src/data/repositories/obstacleRepository');
const { Obstacle } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    Obstacle: {
      create: jest.fn(),
      findByPk: jest.fn(),
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
      const data = { mapId: 1, positionX: 10, positionY: 15, size: 5 };
      Obstacle.create.mockResolvedValue({ id: 1, ...data });

      const result = await obstacleRepository.createObstacle(data);
      expect(Obstacle.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe(1);
    });
  });

  describe('getObstacleById', () => {
    it('should call Obstacle.findByPk', async () => {
      Obstacle.findByPk.mockResolvedValue({ id: 1, mapId: 1 });
      const result = await obstacleRepository.getObstacleById(1);
      expect(Obstacle.findByPk).toHaveBeenCalledWith(1);
      expect(result.mapId).toBe(1);
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
      await obstacleRepository.getAllObstacles(1);
      expect(Obstacle.findAll).toHaveBeenCalledWith({ 
        order: [['createdAt', 'DESC']],
        where: { mapId: 1 }
      });
    });
  });

  describe('updateObstacle', () => {
    it('should call Obstacle.update and return updated row', async () => {
      const data = { size: 10 };
      Obstacle.update.mockResolvedValue([1, [{ id: 1, ...data }]]);
      const result = await obstacleRepository.updateObstacle(1, data);
      expect(Obstacle.update).toHaveBeenCalledWith(data, { where: { id: 1 }, returning: true });
      expect(result.size).toBe(10);
    });

    it('should return null if no rows updated', async () => {
      Obstacle.update.mockResolvedValue([0, []]);
      const result = await obstacleRepository.updateObstacle(999, {});
      expect(result).toBeNull();
    });
  });

  describe('deleteObstacle', () => {
    it('should call Obstacle.destroy and return true if deleted', async () => {
      Obstacle.destroy.mockResolvedValue(1);
      const result = await obstacleRepository.deleteObstacle(1);
      expect(Obstacle.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      Obstacle.destroy.mockResolvedValue(0);
      const result = await obstacleRepository.deleteObstacle(999);
      expect(result).toBe(false);
    });
  });
});
