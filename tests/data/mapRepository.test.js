/* global jest, beforeEach */
const mapRepository = require('../../src/data/repositories/mapRepository');
const { Map, Obstacle, Waypoint } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    Map: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    }
  };
});

describe('Map Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMap', () => {
    it('should call Map.create with correct data', async () => {
      const data = { name: 'Test', width: 10, height: 10 };
      Map.create.mockResolvedValue({ id: 1, ...data });

      const result = await mapRepository.createMap(data);

      expect(Map.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe(1);
    });
  });

  describe('getMapById', () => {
    it('should call Map.findByPk', async () => {
      Map.findByPk.mockResolvedValue({ id: 1, name: 'Test' });

      const result = await mapRepository.getMapById(1);

      expect(Map.findByPk).toHaveBeenCalledWith(1, {
        include: [
          { model: Obstacle, as: 'obstacles' },
          { model: Waypoint, as: 'waypoints' }
        ]
      });
      expect(result.name).toBe('Test');
    });
  });

  describe('getAllMaps', () => {
    it('should call Map.findAll with include and order', async () => {
      Map.findAll.mockResolvedValue([]);
      await mapRepository.getAllMaps();
      expect(Map.findAll).toHaveBeenCalledWith({
        include: [
          { model: Obstacle, as: 'obstacles' },
          { model: Waypoint, as: 'waypoints' }
        ],
        order: [['createdAt', 'DESC']]
      });
    });
  });

  describe('updateMap', () => {
    it('should call Map.update and return updated row', async () => {
      const data = { name: 'Updated' };
      Map.update.mockResolvedValue([1, [{ id: 1, ...data }]]);

      const result = await mapRepository.updateMap(1, data);

      expect(Map.update).toHaveBeenCalledWith(data, { where: { id: 1 }, returning: true });
      expect(result.name).toBe('Updated');
    });
    
    it('should return null if no rows updated', async () => {
      Map.update.mockResolvedValue([0, []]);
      const result = await mapRepository.updateMap(999, { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteMap', () => {
    it('should call Map.destroy and return true if row deleted', async () => {
      Map.destroy.mockResolvedValue(1);

      const result = await mapRepository.deleteMap(1);

      expect(Map.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      Map.destroy.mockResolvedValue(0);
      const result = await mapRepository.deleteMap(999);
      expect(result).toBe(false);
    });
  });
});
