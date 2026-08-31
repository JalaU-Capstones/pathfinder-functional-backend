/* global jest, beforeEach */
const routeRepository = require('../../src/data/repositories/routeRepository');
const { Route } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    Route: {
      create: jest.fn(),
      findOne: jest.fn(),
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
      const data = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', path: [] };
      Route.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data });

      const result = await routeRepository.createRoute(data);
      expect(Route.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should propagate errors from Sequelize', async () => {
      const data = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' };
      const error = new Error('Sequelize error');
      Route.create.mockRejectedValue(error);

      await expect(routeRepository.createRoute(data)).rejects.toThrow('Sequelize error');
      expect(Route.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getRouteById', () => {
    it('should call Route.findOne and return a route', async () => {
      Route.findOne.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' });
      const result = await routeRepository.getRouteById('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(Route.findOne).toHaveBeenCalledWith({ where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } });
      expect(result.mapId).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should return null when route is not found', async () => {
      Route.findOne.mockResolvedValue(null);
      const result = await routeRepository.getRouteById('99999999-9999-9999-9999-999999999999');
      expect(Route.findOne).toHaveBeenCalledWith({ where: { id: '99999999-9999-9999-9999-999999999999' } });
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
      await routeRepository.getAllRoutes('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(Route.findAll).toHaveBeenCalledWith({
        order: [['createdAt', 'DESC']],
        where: { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }
      });
    });
  });

  describe('deleteRoute', () => {
    it('should call Route.destroy and return true if deleted', async () => {
      Route.destroy.mockResolvedValue(1);
      const result = await routeRepository.deleteRoute('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(Route.destroy).toHaveBeenCalledWith({ where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      Route.destroy.mockResolvedValue(0);
      const result = await routeRepository.deleteRoute('99999999-9999-9999-9999-999999999999');
      expect(Route.destroy).toHaveBeenCalledWith({ where: { id: '99999999-9999-9999-9999-999999999999' } });
      expect(result).toBe(false);
    });
  });
});
