/* global jest, beforeEach */
'use strict';

const validationService = require('../../src/business/services/validationService');
const mapRepository = require('../../src/data/repositories/mapRepository');
const { ERROR_TYPES } = require('../../src/utils/errors');

jest.mock('../../src/data/repositories/mapRepository');

describe('validationService', () => {
  const validMapId = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
  const invalidMapId = 'not-a-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateMapIdFormat', () => {
    it('should return success message for a valid UUID format', () => {
      const result = validationService.validateMapIdFormat(validMapId);
      expect(result).toEqual({ message: 'Map ID format is valid.' });
    });

    it('should throw a VALIDATION_ERROR for an invalid UUID format', () => {
      expect(() => validationService.validateMapIdFormat(invalidMapId)).toThrow(
        expect.objectContaining({
          type: ERROR_TYPES.VALIDATION_ERROR
        })
      );
    });
  });

  describe('validateMapIdExists', () => {
    it('should return success message if valid UUID and map is found', async () => {
      mapRepository.getMapById.mockResolvedValue({ id: validMapId });
      const result = await validationService.validateMapIdExists(validMapId);
      expect(result).toEqual({ message: 'Map ID exists in the database.' });
      expect(mapRepository.getMapById).toHaveBeenCalledWith(validMapId);
    });

    it('should throw a NOT_FOUND error if valid UUID but map not found', async () => {
      mapRepository.getMapById.mockResolvedValue(null);
      await expect(validationService.validateMapIdExists(validMapId)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
      expect(mapRepository.getMapById).toHaveBeenCalledWith(validMapId);
    });

    it('should throw a VALIDATION_ERROR for an invalid UUID without calling DB', async () => {
      await expect(validationService.validateMapIdExists(invalidMapId)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
      expect(mapRepository.getMapById).not.toHaveBeenCalled();
    });
  });

  describe('validateMapConfiguration', () => {
    const validConfig = { obstacles: [{ position: { x: 1, y: 1 } }], waypoints: [{ position: { x: 2, y: 2 } }] };

    it('should return success for valid map ID and valid config', () => {
      const result = validationService.validateMapConfiguration(validMapId, validConfig);
      expect(result).toEqual({ message: 'Map configuration validated successfully.' });
    });

    it('should throw VALIDATION_ERROR if missing obstacles', () => {
      const invalidConfig = { obstacles: [], waypoints: [{ position: { x: 2, y: 2 } }] };
      expect(() => validationService.validateMapConfiguration(validMapId, invalidConfig)).toThrow(
        expect.objectContaining({ type: ERROR_TYPES.VALIDATION_ERROR })
      );
    });

    it('should throw VALIDATION_ERROR if invalid UUID format', () => {
      expect(() => validationService.validateMapConfiguration(invalidMapId, validConfig)).toThrow(
        expect.objectContaining({ type: ERROR_TYPES.VALIDATION_ERROR })
      );
    });
  });

  describe('validateDimensions', () => {
    it('should return success for valid dimensions', () => {
      const result = validationService.validateDimensions({ width: 100, height: 100 });
      expect(result).toEqual({ message: 'Map dimensions are within acceptable limits.' });
    });

    it('should throw VALIDATION_ERROR if width is too large', () => {
      expect(() => validationService.validateDimensions({ width: 10005, height: 100 })).toThrow(
        expect.objectContaining({ type: ERROR_TYPES.VALIDATION_ERROR })
      );
    });
  });

  describe('validateNoCyclicDependencies', () => {
    it('should return success for no cycle', () => {
      const config = { connections: [{ source: 'A', target: 'B' }] };
      const result = validationService.validateNoCyclicDependencies(config);
      expect(result).toEqual({ message: 'No cyclic dependencies found in map configuration.' });
    });

    it('should throw VALIDATION_ERROR and contain cycle path if cycle detected', () => {
      const config = { connections: [{ source: 'A', target: 'B' }, { source: 'B', target: 'A' }] };
      expect(() => validationService.validateNoCyclicDependencies(config)).toThrow(
        expect.objectContaining({
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: expect.stringContaining('Cyclic dependency detected')
        })
      );
    });

    it('should throw VALIDATION_ERROR if missing connections array', () => {
      const config = {};
      expect(() => validationService.validateNoCyclicDependencies(config)).toThrow(
        expect.objectContaining({
          type: ERROR_TYPES.VALIDATION_ERROR,
          message: expect.stringContaining('must include a "connections" array')
        })
      );
    });
  });

});
