/* global jest, beforeEach */
const mapRepository = require('../../../src/data/repositories/mapRepository');
const mapService = require('../../../src/business/services/mapService');
const { ERROR_TYPES } = require('../../../src/utils/errors');

// Mock the repository
jest.mock('../../../src/data/repositories/mapRepository');

describe('Map Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toApiShape', () => {
    it('should return null if input is falsy', () => {
      expect(mapService.toApiShape(null)).toBeNull();
    });

    it('should handle input without toJSON method', () => {
      const input = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'A', width: 10, height: 10, obstacles: [], waypoints: [] };
      const result = mapService.toApiShape(input);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('createMapService', () => {
    it('should create a map when input is valid (no relations)', async () => {
      const input = {
        name: 'Test Map',
        dimensions: { width: 100, height: 100 }
      };
      
      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        name: 'Test Map',
        width: 100,
        height: 100,
        obstacles: [],
        waypoints: [],
        createdAt: '2026-07-20T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z',
        toJSON: function() { return this; }
      };

      mapRepository.createMapWithRelations.mockResolvedValue(1);
      mapRepository.getMapById.mockResolvedValue(mockDbResponse);

      const result = await mapService.createMapService(input);

      expect(mapRepository.createMapWithRelations).toHaveBeenCalledWith({
        userId: undefined,
        name: 'Test Map',
        width: 100,
        height: 100,
        obstacles: [],
        waypoints: []
      });

      expect(result).toEqual({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        name: 'Test Map',
        dimensions: { width: 100, height: 100 },
        obstacles: [],
        waypoints: [],
        createdAt: '2026-07-20T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z'
      });
    });

    it('should create a map with obstacles and waypoints', async () => {
      const input = {
        name: 'Test Map',
        dimensions: { width: 100, height: 100 },
        obstacles: [{ position: { x: 10, y: 20 }, size: 5, unknownField: 'ignore' }],
        waypoints: [{ position: { x: 5, y: 5 }, name: 'Start', type: 'ignore' }]
      };
      
      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        name: 'Test Map',
        width: 100,
        height: 100,
        obstacles: [{ positionX: 10, positionY: 20, size: 5 }],
        waypoints: [{ positionX: 5, positionY: 5, name: 'Start' }],
        createdAt: '2026-07-20T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z',
        toJSON: function() { return this; }
      };

      mapRepository.createMapWithRelations.mockResolvedValue(1);
      mapRepository.getMapById.mockResolvedValue(mockDbResponse);

      const result = await mapService.createMapService(input);

      expect(mapRepository.createMapWithRelations).toHaveBeenCalledWith({
        userId: undefined,
        name: 'Test Map',
        width: 100,
        height: 100,
        obstacles: [{ startX: 10, startY: 20, endX: 10, endY: 20, size: 1 }],
        waypoints: [{ positionX: 5, positionY: 5, name: 'Start' }]
      });

      expect(result.obstacles).toEqual([{ x: 10, y: 20 }]);
      expect(result.waypoints).toEqual([{ x: 5, y: 5, name: 'Start' }]);
    });

    it('should throw validation error if obstacle is invalid', async () => {
      const input = {
        name: 'Test Map',
        dimensions: { width: 100, height: 100 },
        obstacles: [{ size: 5 }] // missing position
      };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Obstacle must have non-negative integers startX and startY. endX and endY default to start values.'
      });
    });

    it('should throw validation error if waypoint is invalid', async () => {
      const input = {
        name: 'Test Map',
        dimensions: { width: 10, height: 10 },
        waypoints: [{ position: { x: 5, y: 5 } }] // missing name
      };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Waypoint must have a non-empty string name and a position object with non-negative integer x and y coordinates.'
      });
    });

    it('should throw validation error if name is not a string', async () => {
      const input = { name: 123, dimensions: { width: 100, height: 100 } };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Name is required and must be a non-empty string.'
      });
    });

    it('should throw validation error if name is empty string', async () => {
      const input = { name: '   ', dimensions: { width: 100, height: 100 } };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Name is required and must be a non-empty string.'
      });
    });

    it('should throw validation error if dimensions object is missing', async () => {
      const input = { name: 'Test' };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Dimensions object is required.'
      });
    });

    it('should throw validation error if width is invalid', async () => {
      const input = { name: 'Test', dimensions: { width: -1, height: 10 } };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Width must be a positive integer.'
      });
    });

    it('should throw validation error if height is invalid', async () => {
      const input = { name: 'Test', dimensions: { width: 10, height: -1 } };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: 'Height must be a positive integer.'
      });
    });
  });

  describe('getMapService', () => {
    it('should return a map when found', async () => {
      const mockDbResponse = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        name: 'Test Map',
        width: 100,
        height: 100,
        obstacles: [{ positionX: 3, positionY: 5 }],
        waypoints: [{ positionX: 8, positionY: 6, name: 'Stop 1' }],
        toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue(mockDbResponse);

      const result = await mapService.getMapService('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      
      expect(mapRepository.getMapById).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799', { userId: undefined });
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.dimensions.width).toBe(100);
      expect(result.obstacles).toEqual([{ x: 3, y: 5 }]);
      expect(result.waypoints).toEqual([{ x: 8, y: 6, name: 'Stop 1' }]);
    });

    it('should throw NOT_FOUND error when map does not exist', async () => {
      mapRepository.getMapById.mockResolvedValue(null);

      await expect(mapService.getMapService(999)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });

  describe('getAllMapsService', () => {
    it('should return all maps', async () => {
      mapRepository.getAllMaps.mockResolvedValue([
        { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'A', toJSON: function() { return this; } }
      ]);
      const result = await mapService.getAllMapsService();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });
  });

  describe('updateMapService', () => {
    it('should update a map when valid and existing', async () => {
      const updateData = { name: 'Updated Map', dimensions: { width: 200, height: 200 } };
      const existingMap = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Old Map', width: 100, height: 100 };
      const updatedMock = {
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Updated Map', width: 200, height: 200, toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue(existingMap);
      mapRepository.updateMap.mockResolvedValue(updatedMock);

      const result = await mapService.updateMapService(1, updateData);

      expect(mapRepository.updateMap).toHaveBeenCalledWith(1, { name: 'Updated Map', width: 200, height: 200 }, { userId: undefined });
      expect(result.name).toBe('Updated Map');
    });

    it('should throw NOT_FOUND error if updating non-existent map', async () => {
      mapRepository.getMapById.mockResolvedValue(null);
      const updateData = { name: 'Updated', dimensions: { width: 100, height: 100 } };
      
      await expect(mapService.updateMapService(999, updateData)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });

  describe('deleteMapService', () => {
    it('should return true if map deleted', async () => {
      mapRepository.deleteMap.mockResolvedValue(true);
      const result = await mapService.deleteMapService('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(mapRepository.deleteMap).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799', { userId: undefined });
      expect(result).toBe(true);
    });

    it('should throw NOT_FOUND error if map not deleted (does not exist)', async () => {
      mapRepository.deleteMap.mockResolvedValue(false);
      await expect(mapService.deleteMapService(999)).rejects.toMatchObject({
        type: 'NOT_FOUND'
      });
    });
  });
});
