/* global jest, beforeEach */
const waypointRepository = require('../../src/data/repositories/waypointRepository');
const mapRepository = require('../../src/data/repositories/mapRepository');
const waypointService = require('../../src/business/services/waypointService');
const { ERROR_TYPES } = require('../../src/utils/errors');

jest.mock('../../src/data/repositories/waypointRepository');
jest.mock('../../src/data/repositories/mapRepository');

describe('Waypoint Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWaypointService', () => {
    it('should create a waypoint when input is valid', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: 1 });
      waypointRepository.createWaypoint.mockResolvedValue({
        id: 1, mapId: 1, positionX: 5, positionY: 5, name: 'A', toJSON: function() { return this; }
      });

      const input = { mapId: 1, position: { x: 5, y: 5 }, name: 'A' };
      const result = await waypointService.createWaypointService(input);

      expect(mapRepository.getMapById).toHaveBeenCalledWith(1);
      expect(waypointRepository.createWaypoint).toHaveBeenCalledWith({ mapId: 1, positionX: 5, positionY: 5, name: 'A' });
      expect(result.position).toEqual({ x: 5, y: 5 });
      expect(result.name).toEqual('A');
    });

    it('should throw validation error if name is missing', async () => {
      const input = { mapId: 1, position: { x: 5, y: 5 } };
      await expect(waypointService.createWaypointService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
    });

    it('should throw NOT_FOUND error if map does not exist', async () => {
      mapRepository.getMapById.mockResolvedValue(null);
      const input = { mapId: 99, position: { x: 5, y: 5 }, name: 'A' };
      await expect(waypointService.createWaypointService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('getWaypointService', () => {
    it('should return a waypoint when found', async () => {
      waypointRepository.getWaypointById.mockResolvedValue({
        id: 1, mapId: 1, positionX: 5, positionY: 5, name: 'A', toJSON: function() { return this; }
      });

      const result = await waypointService.getWaypointService(1);
      expect(result.id).toBe(1);
      expect(result.position).toEqual({ x: 5, y: 5 });
    });

    it('should throw NOT_FOUND error when waypoint does not exist', async () => {
      waypointRepository.getWaypointById.mockResolvedValue(null);
      await expect(waypointService.getWaypointService(99)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('updateWaypointService', () => {
    it('should update a waypoint when valid and existing', async () => {
      waypointRepository.getWaypointById.mockResolvedValue({ id: 1, mapId: 1 });
      mapRepository.getMapById.mockResolvedValue({ id: 1 });
      waypointRepository.updateWaypoint.mockResolvedValue({
        id: 1, mapId: 1, positionX: 10, positionY: 10, name: 'B', toJSON: function() { return this; }
      });

      const input = { mapId: 1, position: { x: 10, y: 10 }, name: 'B' };
      const result = await waypointService.updateWaypointService(1, input);

      expect(waypointRepository.updateWaypoint).toHaveBeenCalledWith(1, { mapId: 1, positionX: 10, positionY: 10, name: 'B' });
      expect(result.position).toEqual({ x: 10, y: 10 });
    });

    it('should throw NOT_FOUND error if updating non-existent waypoint', async () => {
      waypointRepository.getWaypointById.mockResolvedValue(null);
      const input = { mapId: 1, position: { x: 10, y: 10 }, name: 'B' };
      await expect(waypointService.updateWaypointService(99, input)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('deleteWaypointService', () => {
    it('should return true if waypoint deleted', async () => {
      waypointRepository.deleteWaypoint.mockResolvedValue(true);
      const result = await waypointService.deleteWaypointService(1);
      expect(result).toBe(true);
    });

    it('should throw NOT_FOUND error if waypoint not deleted', async () => {
      waypointRepository.deleteWaypoint.mockResolvedValue(false);
      await expect(waypointService.deleteWaypointService(99)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });
});
