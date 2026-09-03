const {
  validateMapExists,
  validateStartInBounds,
  validateEndInBounds,
  validatePointsNotEqual,
  requireNonEmpty,
  validateWaypointsInPath
} = require('../../../src/utils/routeValidators');
const { ERROR_TYPES } = require('../../../src/utils/errors');

describe('Route Validators', () => {
  describe('validateMapExists', () => {
    it('throws 404 NOT_FOUND when context.map is null', () => {
      const context = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', map: null };
      expect(() => validateMapExists(context)).toThrow();
      try {
        validateMapExists(context);
      } catch (err) {
        expect(err.type).toBe(ERROR_TYPES.NOT_FOUND);
      }
    });

    it('returns context when map exists', () => {
      const context = { mapId: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', map: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } };
      expect(validateMapExists(context)).toBe(context);
    });
  });

  describe('validateStartInBounds', () => {
    it('throws 400 VALIDATION_ERROR when start is outside grid', () => {
      const context = { map: { width: 10, height: 10 }, start: { x: 10, y: 5 } };
      expect(() => validateStartInBounds(context)).toThrow();
      try {
        validateStartInBounds(context);
      } catch (err) {
        expect(err.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
      }
    });

    it('returns context when start is within grid', () => {
      const context = { map: { width: 10, height: 10 }, start: { x: 5, y: 5 } };
      expect(validateStartInBounds(context)).toBe(context);
    });
  });

  describe('validateEndInBounds', () => {
    it('throws 400 VALIDATION_ERROR when end is outside grid', () => {
      const context = { map: { width: 10, height: 10 }, end: { x: 5, y: 10 } };
      expect(() => validateEndInBounds(context)).toThrow();
    });

    it('returns context when end is within grid', () => {
      const context = { map: { width: 10, height: 10 }, end: { x: 5, y: 5 } };
      expect(validateEndInBounds(context)).toBe(context);
    });
  });

  describe('validatePointsNotEqual', () => {
    it('throws 400 VALIDATION_ERROR when start === end', () => {
      const context = { start: { x: 5, y: 5 }, end: { x: 5, y: 5 } };
      expect(() => validatePointsNotEqual(context)).toThrow();
    });

    it('returns context when start and end differ', () => {
      const context = { start: { x: 1, y: 1 }, end: { x: 2, y: 2 } };
      expect(validatePointsNotEqual(context)).toBe(context);
    });
  });

  describe('requireNonEmpty (HOF)', () => {
    const validateMapHasObstacles = requireNonEmpty('obstacles');

    it('throws 400 VALIDATION_ERROR when obstacles is empty array', () => {
      const context = { map: { obstacles: [] } };
      expect(() => validateMapHasObstacles(context)).toThrow();
    });

    it('throws 400 VALIDATION_ERROR when obstacles is undefined', () => {
      const context = { map: {} };
      expect(() => validateMapHasObstacles(context)).toThrow();
    });

    it('returns context when obstacles array has items', () => {
      const context = { map: { obstacles: [{ x: 1, y: 1 }] } };
      expect(validateMapHasObstacles(context)).toBe(context);
    });
  });

  describe('validateWaypointsInPath', () => {
    it('returns true when all waypoints are present in the path', () => {
      const path = [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }];
      const waypoints = [{ x: 2, y: 2, name: 'mid' }];
      expect(validateWaypointsInPath(path, waypoints)).toBe(true);
    });

    it('returns false when one waypoint is missing from the path', () => {
      const path = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
      const waypoints = [{ x: 3, y: 3, name: 'end' }];
      expect(validateWaypointsInPath(path, waypoints)).toBe(false);
    });

    it('returns true when waypoints array is empty', () => {
      const path = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
      const waypoints = [];
      expect(validateWaypointsInPath(path, waypoints)).toBe(true);
    });

    it('returns true when path is empty and waypoints array is empty', () => {
      const path = [];
      const waypoints = [];
      expect(validateWaypointsInPath(path, waypoints)).toBe(true);
    });
  });
});
