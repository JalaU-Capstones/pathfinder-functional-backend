/* global jest, beforeEach */
const mapRepository = require('../../../src/data/repositories/mapRepository');
const { Map, Obstacle, Waypoint, sequelize } = require('../../../src/data/models');

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
};

jest.mock('../../../src/data/models', () => {
  return {
    sequelize: {
      transaction: jest.fn()
    },
    Map: {
      create: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    },
    Obstacle: {
      bulkCreate: jest.fn()
    },
    Waypoint: {
      bulkCreate: jest.fn()
    }
  };
});

describe('Map Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createMap', () => {
    it('should call Map.create with correct data', async () => {
      const data = { name: 'Test', width: 10, height: 10 };
      Map.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data });

      const result = await mapRepository.createMap(data);

      expect(Map.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('createMapWithRelations', () => {
    it('should create map with obstacles and waypoints and commit transaction', async () => {
      const data = {
        name: 'Test', width: 10, height: 10,
        obstacles: [{ positionX: 1, positionY: 1 }],
        waypoints: [{ positionX: 2, positionY: 2 }]
      };
      
      Map.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      
      const result = await mapRepository.createMapWithRelations(data);
      
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Map.create).toHaveBeenCalledWith({ name: 'Test', width: 10, height: 10 }, { transaction: mockTransaction });
      expect(Obstacle.bulkCreate).toHaveBeenCalledWith([{ positionX: 1, positionY: 1, mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }], { transaction: mockTransaction });
      expect(Waypoint.bulkCreate).toHaveBeenCalledWith([{ positionX: 2, positionY: 2, mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }], { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should create map without obstacles or waypoints if arrays are empty', async () => {
      const data = {
        name: 'Test', width: 10, height: 10,
        obstacles: [],
        waypoints: []
      };
      
      Map.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      
      const result = await mapRepository.createMapWithRelations(data);
      
      expect(Map.create).toHaveBeenCalledWith({ name: 'Test', width: 10, height: 10 }, { transaction: mockTransaction });
      expect(Obstacle.bulkCreate).not.toHaveBeenCalled();
      expect(Waypoint.bulkCreate).not.toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should rollback transaction and propagate error if creation fails', async () => {
      const data = {
        name: 'Test', width: 10, height: 10,
        obstacles: [{ positionX: 1, positionY: 1 }]
      };
      const error = new Error('Database Error');
      
      Map.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      Obstacle.bulkCreate.mockRejectedValue(error);
      
      await expect(mapRepository.createMapWithRelations(data)).rejects.toThrow('Database Error');
      
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('getMapById', () => {
    it('should call Map.findOne', async () => {
      Map.findOne.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Test' });

      const result = await mapRepository.getMapById('3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(Map.findOne).toHaveBeenCalledWith({
        where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' },
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
        where: {},
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
      Map.update.mockResolvedValue([1, [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data }]]);

      const result = await mapRepository.updateMap('3b47e69f-788d-4b19-b81b-0b4a2fd92799', data);

      expect(Map.update).toHaveBeenCalledWith(data, { where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }, returning: true });
      expect(result.name).toBe('Updated');
    });
    
    it('should return null if no rows updated', async () => {
      Map.update.mockResolvedValue([0, []]);
      const result = await mapRepository.updateMap('99999999-9999-9999-9999-999999999999', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteMap', () => {
    it('should call Map.destroy and return true if row deleted', async () => {
      Map.destroy.mockResolvedValue(1);

      const result = await mapRepository.deleteMap('3b47e69f-788d-4b19-b81b-0b4a2fd92799');

      expect(Map.destroy).toHaveBeenCalledWith({ where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      Map.destroy.mockResolvedValue(0);
      const result = await mapRepository.deleteMap('99999999-9999-9999-9999-999999999999');
      expect(result).toBe(false);
    });
  });
});
