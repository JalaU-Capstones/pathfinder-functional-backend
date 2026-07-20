/* global jest, beforeEach */
const mapRepository = require('../../src/data/repositories/mapRepository');
const mapService = require('../../src/business/services/mapService');
const { ERROR_TYPES } = require('../../src/utils/errors');

// Mock the repository
jest.mock('../../src/data/repositories/mapRepository');

describe('Map Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMapService', () => {
    it('should create a map when input is valid', async () => {
      const input = {
        name: 'Test Map',
        dimensions: { width: 100, height: 100 }
      };
      
      const mockDbResponse = {
        id: 1,
        name: 'Test Map',
        width: 100,
        height: 100,
        createdAt: '2026-07-20T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z',
        toJSON: function() { return this; }
      };

      mapRepository.createMap.mockResolvedValue(mockDbResponse);

      const result = await mapService.createMapService(input);

      expect(mapRepository.createMap).toHaveBeenCalledWith({
        name: 'Test Map',
        width: 100,
        height: 100
      });

      expect(result).toEqual({
        id: 1,
        name: 'Test Map',
        dimensions: { width: 100, height: 100 },
        createdAt: '2026-07-20T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z'
      });
    });

    it('should throw validation error if name is missing', async () => {
      const input = { dimensions: { width: 100, height: 100 } };
      await expect(mapService.createMapService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
    });
  });

  describe('getMapService', () => {
    it('should return a map when found', async () => {
      const mockDbResponse = {
        id: 1,
        name: 'Test Map',
        width: 100,
        height: 100,
        toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue(mockDbResponse);

      const result = await mapService.getMapService(1);
      
      expect(mapRepository.getMapById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
      expect(result.dimensions.width).toBe(100);
    });

    it('should throw NOT_FOUND error when map does not exist', async () => {
      mapRepository.getMapById.mockResolvedValue(null);

      await expect(mapService.getMapService(999)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('updateMapService', () => {
    it('should update a map when valid and existing', async () => {
      const updateData = { name: 'Updated Map', dimensions: { width: 200, height: 200 } };
      const existingMap = { id: 1, name: 'Old Map', width: 100, height: 100 };
      const updatedMock = {
        id: 1, name: 'Updated Map', width: 200, height: 200, toJSON: function() { return this; }
      };

      mapRepository.getMapById.mockResolvedValue(existingMap);
      mapRepository.updateMap.mockResolvedValue(updatedMock);

      const result = await mapService.updateMapService(1, updateData);

      expect(mapRepository.updateMap).toHaveBeenCalledWith(1, { name: 'Updated Map', width: 200, height: 200 });
      expect(result.name).toBe('Updated Map');
    });

    it('should throw NOT_FOUND error if updating non-existent map', async () => {
      mapRepository.getMapById.mockResolvedValue(null);
      const updateData = { name: 'Updated', dimensions: { width: 100, height: 100 } };
      
      await expect(mapService.updateMapService(999, updateData)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('deleteMapService', () => {
    it('should return true if map deleted', async () => {
      mapRepository.deleteMap.mockResolvedValue(true);
      const result = await mapService.deleteMapService(1);
      expect(mapRepository.deleteMap).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw NOT_FOUND error if map not deleted (does not exist)', async () => {
      mapRepository.deleteMap.mockResolvedValue(false);
      await expect(mapService.deleteMapService(999)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });
});
