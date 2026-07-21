/* global jest, beforeEach */
const waypointRepository = require('../../src/data/repositories/waypointRepository');
const { Waypoint } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    Waypoint: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
    }
  };
});

describe('Waypoint Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWaypoint', () => {
    it('should call Waypoint.create', async () => {
      const data = { mapId: 1, positionX: 5, positionY: 5, name: 'A' };
      Waypoint.create.mockResolvedValue(data);
      const result = await waypointRepository.createWaypoint(data);
      expect(Waypoint.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe('getWaypointById', () => {
    it('should call Waypoint.findByPk', async () => {
      Waypoint.findByPk.mockResolvedValue({ id: 1 });
      const result = await waypointRepository.getWaypointById(1);
      expect(Waypoint.findByPk).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  describe('getAllWaypoints', () => {
    it('should call Waypoint.findAll without mapId', async () => {
      Waypoint.findAll.mockResolvedValue([]);
      await waypointRepository.getAllWaypoints();
      expect(Waypoint.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']]
      });
    });

    it('should call Waypoint.findAll with mapId', async () => {
      Waypoint.findAll.mockResolvedValue([]);
      await waypointRepository.getAllWaypoints(2);
      expect(Waypoint.findAll).toHaveBeenCalledWith({
        where: { mapId: 2 },
        order: [['createdAt', 'DESC']]
      });
    });
  });

  describe('updateWaypoint', () => {
    it('should call Waypoint.update and return updated row', async () => {
      const data = { positionX: 10 };
      Waypoint.update.mockResolvedValue([1, [{ id: 1, positionX: 10 }]]);
      const result = await waypointRepository.updateWaypoint(1, data);
      expect(Waypoint.update).toHaveBeenCalledWith(data, { where: { id: 1 }, returning: true });
      expect(result.positionX).toBe(10);
    });

    it('should return null if no row updated', async () => {
      Waypoint.update.mockResolvedValue([0, []]);
      const result = await waypointRepository.updateWaypoint(99, { positionX: 10 });
      expect(result).toBeNull();
    });
  });

  describe('deleteWaypoint', () => {
    it('should call Waypoint.destroy and return true if deleted', async () => {
      Waypoint.destroy.mockResolvedValue(1);
      const result = await waypointRepository.deleteWaypoint(1);
      expect(Waypoint.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false if not deleted', async () => {
      Waypoint.destroy.mockResolvedValue(0);
      const result = await waypointRepository.deleteWaypoint(99);
      expect(result).toBe(false);
    });
  });
});
