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

  // ─── Phase 13C: Concurrency & Parallel Validations ───────────────────────────

  describe('validateStartEndNotObstructed', () => {
    it('should resolve if valid path exists and obstacles is array', async () => {
      // MapId is valid UUID, obstacles is array. Start (0,0) to End (0,2). Obstacle at (1,1) shouldn't block.
      const data = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 2 },
        obstacles: [{ x: 1, y: 1 }],
      };
      await expect(validationService.validateStartEndNotObstructed(data)).resolves.toEqual({
        message: expect.stringContaining('At least one valid path exists'),
      });
    });

    it('should throw if path is blocked', async () => {
      // Start (0,0) to End (2,0) blocked by obstacles at (1,-1), (1,0), (1,1) - wait, A* allows diagonal unless blocked.
      // Easiest block is surround start.
      const data = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 2, y: 0 },
        obstacles: [
          { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
          { x: -1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ],
      };
      await expect(validationService.validateStartEndNotObstructed(data)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND,
      });
    });

    it('should throw VALIDATION_ERROR if obstacles is not an array', async () => {
      const data = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 2 },
        obstacles: null,
      };
      await expect(validationService.validateStartEndNotObstructed(data)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
      });
    });
  });

  describe('validateAtLeastOneValidPath', () => {
    it('should resolve if valid path exists on stored map', async () => {
      mapRepository.getMapById.mockResolvedValueOnce({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        width: 10, height: 10, obstacles: []
      });
      const data = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', // Matches mock
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 2 },
      };
      await expect(validationService.validateAtLeastOneValidPath(data)).resolves.toEqual({
        message: expect.stringContaining('A valid path exists'),
      });
    });

    it('should throw NOT_FOUND if map does not exist', async () => {
      mapRepository.getMapById.mockResolvedValueOnce(null);
      const data = {
        mapId: '999e4567-e89b-42d3-a456-426614174999', // Unknown
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 2 },
      };
      await expect(validationService.validateAtLeastOneValidPath(data)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND,
      });
    });
  });

  describe('analyzeRoutePerformance', () => {
    it('should resolve with 5 runs and timing data', async () => {
      const data = {
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 2 },
        obstacles: [],
      };
      const res = await validationService.analyzeRoutePerformance(data);
      expect(res.analysis).toBeDefined();
      expect(res.analysis.runs).toBe(5);
      expect(res.analysis.consistent).toBe(true);
      expect(res.analysis.pathFound).toBe(true);
    });
  });

  describe('validateRouteNoIntersections', () => {
    it('should pass if route has no intersections', () => {
      const res = validationService.validateRouteNoIntersections({
        path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
        obstacles: [{ x: 2, y: 2 }],
      });
      expect(res.message).toBeDefined();
    });

    it('should throw VALIDATION_ERROR if path intersects obstacle', () => {
      expect(() => validationService.validateRouteNoIntersections({
        path: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        obstacles: [{ x: 1, y: 1 }],
      })).toThrow(/intersects with an obstacle/);
    });
  });

  describe('validateRouteLength', () => {
    it('should pass if route length is within limits', () => {
      const res = validationService.validateRouteLength({
        path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      });
      expect(res.length).toBe(2);
    });

    it('should throw VALIDATION_ERROR if route length exceeds MAX_ROUTE_LENGTH', () => {
      // Mock an array of length MAX_ROUTE_LENGTH + 1
      const path = new Array(validationService.MAX_ROUTE_LENGTH + 1).fill({ x: 0, y: 0 });
      expect(() => validationService.validateRouteLength({ path })).toThrow(/exceeds the maximum/);
    });
  });

  describe('handleSameStartEnd', () => {
    it('should return samePoint: true if points are identical', () => {
      const res = validationService.handleSameStartEnd({
        startPoint: { x: 5, y: 5 }, endPoint: { x: 5, y: 5 },
      });
      expect(res.samePoint).toBe(true);
    });

    it('should return samePoint: false if points differ', () => {
      const res = validationService.handleSameStartEnd({
        startPoint: { x: 5, y: 5 }, endPoint: { x: 5, y: 6 },
      });
      expect(res.samePoint).toBe(false);
    });
  });

  describe('validateRouteComprehensive', () => {
    it('should pass all checks concurrently if valid', async () => {
      const data = {
        mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 1, y: 0 },
        obstacles: [{ x: 5, y: 5 }],
        path: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
      };
      const res = await validationService.validateRouteComprehensive(data);
      expect(res.results).toHaveLength(4);
    });

    it('should throw combined errors if multiple checks fail', async () => {
      const data = {
        mapId: 'invalid-uuid',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 1, y: 0 },
        obstacles: [{ x: 1, y: 0 }], // intersects
        path: [{ x: 0, y: 0 }, { x: 1, y: 0 }], // length is fine
      };
      await expect(validationService.validateRouteComprehensive(data)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR,
        message: expect.stringMatching(/invalid-uuid.*intersects/i), // Matches both errors loosely
      });
    });
  });
  // ─── Phase 14C: Filters, Accumulators & Memoization ───────────────────────

  describe('validateMapHasValidWaypoints', () => {
    it('returns valid count if valid stopping points exist', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1], [2, 2]],
        obstacles: [],
      };
      const res = validationService.validateMapHasValidWaypoints(map);
      expect(res.valid).toBe(true);
      expect(res.validCount).toBe(2);
    });

    it('throws VALIDATION_ERROR if no valid stopping points exist', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[-1, -1]],
        obstacles: [],
      };
      expect(() => validationService.validateMapHasValidWaypoints(map)).toThrow(
        expect.objectContaining({ type: ERROR_TYPES.VALIDATION_ERROR })
      );
    });
  });

  describe('checkWaypointReachability', () => {
    it('returns reachable status correctly', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1], [2, 2]],
        obstacles: [],
      };
      const res = validationService.checkWaypointReachability(map);
      expect(res.reachable).toBe(true);
      expect(res.unreachablePoints).toEqual([]);
    });

    it('throws VALIDATION_ERROR if invalid map input', () => {
      expect(() => validationService.checkWaypointReachability({})).toThrow(
        expect.objectContaining({ type: ERROR_TYPES.VALIDATION_ERROR })
      );
    });
  });

  describe('validateComplexGeometry', () => {
    it('returns valid for a reachable end point', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[2, 2]],
        obstacles: [],
      };
      const res = validationService.validateComplexGeometry(map);
      expect(res.valid).toBe(true);
    });
  });

  describe('validateAllRoutes', () => {
    it('returns route count correctly', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1], [2, 2]],
        obstacles: [],
      };
      const res = validationService.validateAllRoutes(map);
      expect(res.consideredAllRoutes).toBe(true);
      expect(res.routesCount).toBe(2);
    });
  });

  describe('validateOptimalRoute', () => {
    it('returns optimal route distance', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1]],
        obstacles: [],
      };
      const res = validationService.validateOptimalRoute(map);
      expect(res.optimal).toBe(true);
      expect(res.distance).toBeGreaterThan(0);
    });
  });

  describe('validateMapInputService', () => {
    it('returns valid for good input', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1]],
        obstacles: [],
      };
      const res = validationService.validateMapInputService(map);
      expect(res.valid).toBe(true);
    });
  });

  describe('validateLargeMap', () => {
    it('returns large map processing stats', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1]],
        obstacles: [],
      };
      const res = validationService.validateLargeMap(map);
      expect(res.canHandleLargeMap).toBe(true);
      expect(res.processed).toBe(1);
    });
  });
});

