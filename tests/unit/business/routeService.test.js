/* global jest, beforeEach */
const routeService = require('../../../src/business/services/routeService');
const routeRepository = require('../../../src/data/repositories/routeRepository');
const mapRepository = require('../../../src/data/repositories/mapRepository');
const pathfinder = require('../../../src/business/pathfinder');

jest.mock('../../../src/data/repositories/routeRepository');
jest.mock('../../../src/data/repositories/mapRepository');
jest.mock('../../../src/business/pathfinder');

describe('Route Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toApiShape', () => {
    it('should return null if input is falsy', () => {
      expect(routeService.toApiShape(null)).toBeNull();
    });

    it('should handle input without toJSON method and path', () => {
      const input = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 0, startY: 0, endX: 5, endY: 5, distance: 10 };
      const result = routeService.toApiShape(input);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.optimal_path).toBeNull();
    });

    it('should handle input with toJSON method', () => {
      const input = { toJSON: () => ({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 0, startY: 0, endX: 5, endY: 5, distance: 10 }) };
      const result = routeService.toApiShape(input);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('createRouteService', () => {
    it('should create a route successfully for valid input', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', width: 10, height: 10, obstacles: [{ positionX: 1, positionY: 1 }], waypoints: [] };
      mapRepository.getMapById.mockResolvedValue(mockMap);
      
      pathfinder.calculatePath.mockReturnValue({
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}]
      });

      routeRepository.createRoute.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 7,
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}],
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z'
      });

      const routeData = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        start: { x: 0, y: 0 },
        end: { x: 5, y: 7 }
      };

      const result = await routeService.createRouteService(routeData);

      expect(mapRepository.getMapById).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799', { userId: undefined });
      expect(pathfinder.calculatePath).toHaveBeenCalledWith(
        { width: 10, height: 10 },
        { x: 0, y: 0 },
        { x: 5, y: 7 },
        [{ x: 1, y: 1 }],
        []
      );
      
      expect(routeRepository.createRoute).toHaveBeenCalledWith({
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 7,
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}],
        userId: undefined
      });

      expect(result).toEqual({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        start: { x: 0, y: 0 },
        end: { x: 5, y: 7 },
        distance: 12,
        optimal_path: [{x:0,y:0}, {x:5,y:7}],
        createdAt: '2026-07-21T00:00:00.000Z',
        updatedAt: '2026-07-21T00:00:00.000Z'
      });
    });

    it('should handle map without waypoints', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', width: 10, height: 10, obstacles: [{ positionX: 1, positionY: 1 }] }; // no waypoints
      mapRepository.getMapById.mockResolvedValue(mockMap);
      
      pathfinder.calculatePath.mockReturnValue({
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}]
      });

      routeRepository.createRoute.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 0, startY: 0, endX: 5, endY: 7, distance: 12, path: []
      });

      const routeData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', start: { x: 0, y: 0 }, end: { x: 5, y: 7 } };
      const result = await routeService.createRouteService(routeData);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should throw 404 if map does not exist', async () => {
      mapRepository.getMapById.mockResolvedValue(null);

      const routeData = {
        mapId: '99999999-9999-9999-9999-999999999999',
        start: { x: 0, y: 0 },
        end: { x: 5, y: 5 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });

    it('should throw 400 if start and end points are the same', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', width: 10, height: 10, obstacles: [{x:0, y:0}] });

      const routeData = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        start: { x: 5, y: 5 },
        end: { x: 5, y: 5 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Start and end points cannot be the same.'
      });
    });

    it('should throw 400 if coordinates are out of bounds', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', width: 10, height: 10, obstacles: [{x:0, y:0}] });

      const routeData = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        start: { x: 15, y: 5 },
        end: { x: 5, y: 5 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Coordinates must be within map boundaries.'
      });
    });

    it('should throw 422 if waypoint compliance fails', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', width: 10, height: 10, obstacles: [{ positionX: 1, positionY: 1 }], waypoints: [{ positionX: 3, positionY: 3, name: 'Mid' }] };
      mapRepository.getMapById.mockResolvedValue(mockMap);
      
      pathfinder.calculatePath.mockReturnValue({
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}] // misses waypoint (3,3)
      });

      const routeData = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        start: { x: 0, y: 0 },
        end: { x: 5, y: 7 }
      };

      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'UNPROCESSABLE_ENTITY',
        message: 'The computed path could not satisfy all waypoint constraints. Verify that waypoints are reachable and not blocked by obstacles.'
      });
    });
  });

  describe('createRouteService with isolated modules', () => {
    let isolatedRouteService;
    beforeEach(() => {
      jest.isolateModules(() => {
        jest.doMock('../../../src/utils/compose', () => ({
          pipe: () => (context) => context // bypass validation
        }));
        isolatedRouteService = require('../../../src/business/services/routeService');
      });
    });

    it('should handle map without obstacles and waypoints (bypassing validation)', async () => {
      const mockMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', width: 10, height: 10 }; // no obstacles, no waypoints
      const mapRepo = require('../../../src/data/repositories/mapRepository');
      mapRepo.getMapById.mockResolvedValue(mockMap);
      
      const pFinder = require('../../../src/business/pathfinder');
      pFinder.calculatePath.mockReturnValue({
        distance: 12,
        path: [{x:0,y:0}, {x:5,y:7}]
      });

      const routeRepo = require('../../../src/data/repositories/routeRepository');
      routeRepo.createRoute.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 0, startY: 0, endX: 5, endY: 7, distance: 12, path: []
      });

      const routeData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', start: { x: 0, y: 0 }, end: { x: 5, y: 7 } };
      const result = await isolatedRouteService.createRouteService(routeData);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('createRouteService validations', () => {
    it('should throw 400 if mapId is missing or not an integer', async () => {
      const routeData = { start: { x: 0, y: 0 }, end: { x: 5, y: 5 } };
      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'mapId is required and must be a string.'
      });
      await expect(routeService.createRouteService({ ...routeData, mapId: '1' })).rejects.toMatchObject({
        type: 'VALIDATION_ERROR'
      });
    });

    it('should throw 400 if point object is missing', async () => {
      const routeData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', end: { x: 5, y: 5 } };
      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Start object is required.'
      });
    });

    it('should throw 400 if point x is negative or not integer', async () => {
      const routeData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', start: { x: -1, y: 0 }, end: { x: 5, y: 5 } };
      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Start x must be a non-negative integer.'
      });
    });

    it('should throw 400 if point y is negative or not integer', async () => {
      const routeData = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', start: { x: 0, y: -1 }, end: { x: 5, y: 5 } };
      await expect(routeService.createRouteService(routeData)).rejects.toMatchObject({
        type: 'VALIDATION_ERROR',
        message: 'Start y must be a non-negative integer.'
      });
    });
  });

  describe('getAllRoutesService', () => {
    it('should return all routes without mapId', async () => {
      routeRepository.getAllRoutes.mockResolvedValue([{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 0, startY: 0, endX: 5, endY: 5 }]);
      const result = await routeService.getAllRoutesService();
      expect(routeRepository.getAllRoutes).toHaveBeenCalledWith(null, { userId: undefined });
      expect(result).toHaveLength(1);
    });

    it('should return all routes with mapId', async () => {
      routeRepository.getAllRoutes.mockResolvedValue([{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', startX: 0, startY: 0, endX: 5, endY: 5 }]);
      const result = await routeService.getAllRoutesService('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(routeRepository.getAllRoutes).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799', { userId: undefined });
      expect(result).toHaveLength(1);
    });
  });

  describe('getRouteService', () => {
    it('should return route by id', async () => {
      routeRepository.getRouteById.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startX: 0,
        startY: 0,
        endX: 5,
        endY: 5,
        distance: 10,
        path: [{x:0,y:0}, {x:5,y:5}]
      });

      const result = await routeService.getRouteService(1);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.distance).toBe(10);
      expect(result.optimal_path).toEqual([{x:0,y:0}, {x:5,y:5}]);
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
