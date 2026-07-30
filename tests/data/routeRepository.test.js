/* global jest, beforeEach */
const routeRepository = require('../../src/data/repositories/routeRepository');
const { Route } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    Route: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn()
    }
  };
});

describe('Route Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRoute', () => {
    it('should create and return a route', async () => {
      const data = { mapId: 1, path: [] };
      Route.create.mockResolvedValue({ id: 1, ...data });

      const result = await routeRepository.createRoute(data);
      expect(Route.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe(1);
    });

    it('should propagate errors from Sequelize', async () => {
      const data = { mapId: 1 };
      const error = new Error('Sequelize error');
      Route.create.mockRejectedValue(error);

      await expect(routeRepository.createRoute(data)).rejects.toThrow('Sequelize error');
      expect(Route.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getRouteById', () => {
    it('should call Route.findByPk and return a route', async () => {
      Route.findByPk.mockResolvedValue({ id: 1, mapId: 1 });
      const result = await routeRepository.getRouteById(1);
      expect(Route.findByPk).toHaveBeenCalledWith(1);
      expect(result.mapId).toBe(1);
    });

    it('should return null when route is not found', async () => {
      Route.findByPk.mockResolvedValue(null);
      const result = await routeRepository.getRouteById(999);
      expect(Route.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('getAllRoutes', () => {
    it('should call Route.findAll with no filter when mapId is not provided', async () => {
      Route.findAll.mockResolvedValue([]);
      await routeRepository.getAllRoutes();
      expect(Route.findAll).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
    });

    it('should call Route.findAll with mapId filter when provided', async () => {
      Route.findAll.mockResolvedValue([]);
      await routeRepository.getAllRoutes(1);
      expect(Route.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
        where: { mapId: 1 }
      });
    });
  });

  describe('deleteRoute', () => {
    it('should call Route.destroy and return true if deleted', async () => {
      Route.destroy.mockResolvedValue(1);
      const result = await routeRepository.deleteRoute(1);
      expect(Route.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      Route.destroy.mockResolvedValue(0);
      const result = await routeRepository.deleteRoute(999);
      expect(Route.destroy).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBe(false);
    });
  });
});
