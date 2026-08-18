const {
  filterValidWaypoints,
  filterReachableWaypoints,
  filterValidMapInput,
} = require('../../src/utils/filters');

describe('filters util', () => {
  describe('filterValidWaypoints', () => {
    it('returns all valid items for a valid waypoints array', () => {
      const input = [
        { position: { x: 1, y: 2 }, name: 'A' },
        { position: { x: 3, y: 4 }, name: 'B' },
      ];
      expect(filterValidWaypoints(input)).toEqual(input);
    });

    it('returns only valid items for mixed valid/invalid input', () => {
      const input = [
        { position: { x: 1, y: 2 }, name: 'A' },
        null,
        { position: { x: -1, y: 2 }, name: 'B' },
        { position: { x: 3, y: 4 }, name: 'C' },
      ];
      expect(filterValidWaypoints(input)).toEqual([
        { position: { x: 1, y: 2 }, name: 'A' },
        { position: { x: 3, y: 4 }, name: 'C' },
      ]);
    });

    it('returns empty array for all invalid input', () => {
      const input = [
        null,
        {},
        { position: { x: -1, y: 2 }, name: 'A' },
        { position: { x: 1, y: 2 }, name: '   ' },
      ];
      expect(filterValidWaypoints(input)).toEqual([]);
    });

    it('returns empty array for non-array input', () => {
      expect(filterValidWaypoints(null)).toEqual([]);
      expect(filterValidWaypoints({})).toEqual([]);
      expect(filterValidWaypoints('string')).toEqual([]);
    });

    it('excludes waypoint missing position', () => {
      const input = [{ name: 'A' }];
      expect(filterValidWaypoints(input)).toEqual([]);
    });

    it('excludes waypoint with negative coordinates', () => {
      const input = [{ position: { x: -1, y: -2 }, name: 'A' }];
      expect(filterValidWaypoints(input)).toEqual([]);
    });

    it('excludes waypoint with empty name', () => {
      const input = [{ position: { x: 1, y: 2 }, name: '   ' }];
      expect(filterValidWaypoints(input)).toEqual([]);
    });
  });

  describe('filterReachableWaypoints', () => {
    it('excludes waypoint on obstacle position', () => {
      const waypoints = [{ position: { x: 1, y: 1 }, name: 'A' }];
      const obstacles = [{ x: 1, y: 1 }];
      const grid = { width: 10, height: 10 };
      expect(filterReachableWaypoints(waypoints, obstacles, grid)).toEqual([]);
    });

    it('excludes waypoint outside grid bounds', () => {
      const waypoints = [{ position: { x: 15, y: 15 }, name: 'A' }];
      const obstacles = [];
      const grid = { width: 10, height: 10 };
      expect(filterReachableWaypoints(waypoints, obstacles, grid)).toEqual([]);
    });

    it('includes valid waypoint not on obstacle', () => {
      const waypoints = [{ position: { x: 2, y: 2 }, name: 'A' }];
      const obstacles = [{ x: 1, y: 1 }];
      const grid = { width: 10, height: 10 };
      expect(filterReachableWaypoints(waypoints, obstacles, grid)).toEqual(waypoints);
    });

    it('returns all waypoints for empty obstacles array', () => {
      const waypoints = [
        { position: { x: 2, y: 2 }, name: 'A' },
        { position: { x: 3, y: 3 }, name: 'B' },
      ];
      const obstacles = [];
      const grid = { width: 10, height: 10 };
      expect(filterReachableWaypoints(waypoints, obstacles, grid)).toEqual(waypoints);
    });
  });

  describe('filterValidMapInput', () => {
    it('returns valid for a valid map', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1]],
        obstacles: [],
      };
      expect(filterValidMapInput(map)).toEqual({ valid: true, errors: [] });
    });

    it('returns error if map is null', () => {
      const result = filterValidMapInput(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Map must be an object.');
    });

    it('returns specific error if startingPoint not array', () => {
      const map = {
        startingPoint: '0,0',
        stoppingPoints: [[1, 1]],
        obstacles: [],
      };
      const result = filterValidMapInput(map);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('startingPoint must be an array of two numbers [x, y].');
    });

    it('returns specific error if stoppingPoints empty array', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [],
        obstacles: [],
      };
      const result = filterValidMapInput(map);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('stoppingPoints must be a non-empty array.');
    });

    it('returns specific error if obstacles is string (point 6 example)', () => {
      const map = {
        startingPoint: [0, 0],
        stoppingPoints: [[1, 1]],
        obstacles: 'invalid_data',
      };
      const result = filterValidMapInput(map);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('obstacles must be an array.');
    });

    it('returns all errors in errors array for multiple errors', () => {
      const map = {
        startingPoint: [0],
        stoppingPoints: [],
        obstacles: 'invalid_data',
      };
      const result = filterValidMapInput(map);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(3);
      expect(result.errors).toContain('startingPoint must be an array of two numbers [x, y].');
      expect(result.errors).toContain('stoppingPoints must be a non-empty array.');
      expect(result.errors).toContain('obstacles must be an array.');
    });
  });
});
