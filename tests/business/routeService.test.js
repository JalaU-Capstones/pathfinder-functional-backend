/* global jest, beforeEach */
const routeService = require('../../src/business/services/routeService');
const routeRepository = require('../../src/data/repositories/routeRepository');
const mapRepository = require('../../src/data/repositories/mapRepository');
const pathfinder = require('../../src/business/pathfinder');

jest.mock('../../src/data/repositories/routeRepository');
jest.mock('../../src/data/repositories/mapRepository');
jest.mock('../../src/business/pathfinder');

describe('Route Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRouteService', () => {
    it('should create a route successfully for valid input', async () => {
      const mockMap = { id: 1, width: 10, height: 10, obstacles: [], waypoints: [] };
      mapRepository.getMapById.mockResolvedValue(mockMap);
      
      pathfinder.calculatePath.mockReturnValue({
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}]
      });

      routeRepository.createRoute.mockResolvedValue({
        id: 1,
        mapId: 1,
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 7,
        distance: 12,
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z'
      });

      const routeData = {
        mapId: 1,
        start: { x: 0, y: 0 },
        end: { x: 5, y: 7 }
      };

      const result = await routeService.createRouteService(routeData);

      expect(mapRepository.getMapById).toHaveBeenCalledWith(1);
      expect(pathfinder.calculatePath).toHaveBeenCalledWith(
        { width: 10, height: 10 },
        { x: 0, y: 0 },
        { x: 5, y: 7 },
        [],
        []
      );
      
      expect(routeRepository.createRoute).toHaveBeenCalledWith({
        mapId: 1,
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 7,
        distance: 12
      });

      expect(result).toEqual({
        id: 1,
        mapId: 1,
        start: { x: 0, y: 0 },
        end: { x: 5, y: 7 },
        distance: 12,
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z'
      });
    });

    it('should throw 404 if map does not exist', async () => {
      mapRepository.getMapById.mockResolvedValue(null);

      const routeData = {
        mapId: 999,
        start: { x: 0, y: 0 },
        end: { x: 5, y: 5 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });

    it('should throw 400 if start and end points are the same', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: 1, width: 10, height: 10 });

      const routeData = {
        mapId: 1,
        start: { x: 5, y: 5 },
        end: { x: 5, y: 5 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Start and end points cannot be the same.'
      });
    });

    it('should throw 400 if coordinates are out of bounds', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: 1, width: 10, height: 10 });

      const routeData = {
        mapId: 1,
        start: { x: 15, y: 5 },
        end: { x: 5, y: 5 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Coordinates must be within map boundaries.'
      });
    });
  });

  describe('getRouteService', () => {
    it('should return route by id', async () => {
      routeRepository.getRouteById.mockResolvedValue({
        id: 1,
        mapId: 1,
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 5,
        distance: 10
      });

      const result = await routeService.getRouteService(1);
      expect(result.id).toBe(1);
      expect(result.distance).toBe(10);
    });

    it('should throw 404 if route not found', async () => {
      routeRepository.getRouteById.mockResolvedValue(null);
      await expect(routeService.getRouteService(999)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });

  describe('deleteRouteService', () => {
    it('should delete route by id', async () => {
      routeRepository.deleteRoute.mockResolvedValue(true);
      const result = await routeService.deleteRouteService(1);
      expect(result).toBe(true);
    });

    it('should throw 404 if route not found', async () => {
      routeRepository.deleteRoute.mockResolvedValue(false);
      await expect(routeService.deleteRouteService(999)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });
});
