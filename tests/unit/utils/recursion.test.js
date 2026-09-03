'use strict';



const {
  validateUuidFormat,
  validateMapConfigStructure,
  validateMapDimensions,
  detectCyclicDependencies,
} = require('../../../src/utils/recursion');

describe('Recursive Validation Functions', () => {

  describe('validateUuidFormat', () => {
    it('should return true for a valid UUID v4', () => {
      const valid = '3b47e69f-788d-4b19-b81b-0b4a2fd92799';
      expect(validateUuidFormat(valid)).toBe(true);
    });

    it('should return false for wrong number of segments', () => {
      expect(validateUuidFormat('3b47e69f-788d-4b19-b81b')).toBe(false);
    });

    it('should return false for a segment with wrong length', () => {
      expect(validateUuidFormat('3b47e69f-788d-4b1-b81b-0b4a2fd92799')).toBe(false);
    });

    it('should return false for non-hex characters', () => {
      expect(validateUuidFormat('3b47e69z-788d-4b19-b81b-0b4a2fd92799')).toBe(false);
    });

    it('should return false if version digit (segment 2) is not 4', () => {
      expect(validateUuidFormat('3b47e69f-788d-1b19-b81b-0b4a2fd92799')).toBe(false);
    });

    it('should return false if variant digit (segment 3) is not 8,9,a,b', () => {
      expect(validateUuidFormat('3b47e69f-788d-4b19-c81b-0b4a2fd92799')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(validateUuidFormat('')).toBe(false);
    });

    it('should return false for integer input', () => {
      expect(validateUuidFormat(123)).toBe(false);
    });

    it('should return false for null input', () => {
      expect(validateUuidFormat(null)).toBe(false);
    });
  });

  describe('validateMapConfigStructure', () => {
    it('should return valid true for config with obstacles and waypoints', () => {
      const config = {
        obstacles: [{ position: { x: 1, y: 1 } }],
        waypoints: [{ position: { x: 2, y: 2 } }],
      };
      expect(validateMapConfigStructure(config)).toEqual({ valid: true, error: null });
    });

    it('should return valid false for empty obstacles array', () => {
      const config = { obstacles: [], waypoints: [{ position: { x: 2, y: 2 } }] };
      expect(validateMapConfigStructure(config).valid).toBe(false);
    });

    it('should return valid false for empty waypoints array', () => {
      const config = { obstacles: [{ position: { x: 1, y: 1 } }], waypoints: [] };
      expect(validateMapConfigStructure(config).valid).toBe(false);
    });

    it('should return valid false if obstacle missing position', () => {
      const config = { obstacles: [{ }], waypoints: [{ position: { x: 2, y: 2 } }] };
      expect(validateMapConfigStructure(config).valid).toBe(false);
    });

    it('should return valid false if position missing x', () => {
      const config = { obstacles: [{ position: { y: 1 } }], waypoints: [{ position: { x: 2, y: 2 } }] };
      expect(validateMapConfigStructure(config).valid).toBe(false);
    });

    it('should return valid false for null config', () => {
      expect(validateMapConfigStructure(null).valid).toBe(false);
    });
  });

  describe('validateMapDimensions', () => {
    it('should return valid true for valid dimensions (100x80)', () => {
      expect(validateMapDimensions({ width: 100, height: 80 })).toEqual({ valid: true, error: null });
    });

    it('should return valid false if width below minimum', () => {
      expect(validateMapDimensions({ width: 5, height: 80 }).valid).toBe(false);
    });

    it('should return valid false if width above maximum', () => {
      expect(validateMapDimensions({ width: 10005, height: 80 }).valid).toBe(false);
    });

    it('should return valid false if height below minimum', () => {
      expect(validateMapDimensions({ width: 100, height: 5 }).valid).toBe(false);
    });

    it('should return valid false if height above maximum', () => {
      expect(validateMapDimensions({ width: 100, height: 10005 }).valid).toBe(false);
    });

    it('should return valid false for non-numeric width', () => {
      expect(validateMapDimensions({ width: '100', height: 80 }).valid).toBe(false);
    });
  });

  describe('detectCyclicDependencies', () => {
    it('should return false for no connections', () => {
      expect(detectCyclicDependencies([])).toEqual({ hasCycle: false, cycle: null });
    });

    it('should return false for linear chain A->B->C', () => {
      const conns = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' }
      ];
      expect(detectCyclicDependencies(conns)).toEqual({ hasCycle: false, cycle: null });
    });

    it('should return true for simple cycle A->B->A', () => {
      const conns = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'A' }
      ];
      const result = detectCyclicDependencies(conns);
      expect(result.hasCycle).toBe(true);
      expect(result.cycle.length).toBeGreaterThan(0);
    });

    it('should return true for triangle cycle A->B->C->A', () => {
      const conns = [
        { source: 'A', target: 'B' },
        { source: 'B', target: 'C' },
        { source: 'C', target: 'A' }
      ];
      const result = detectCyclicDependencies(conns);
      expect(result.hasCycle).toBe(true);
      expect(result.cycle.length).toBeGreaterThan(0);
    });

    it('should return false for disconnected nodes with no cycle', () => {
      const conns = [
        { source: 'A', target: 'B' },
        { source: 'C', target: 'D' }
      ];
      expect(detectCyclicDependencies(conns)).toEqual({ hasCycle: false, cycle: null });
    });

    it('should return true for self-loop A->A', () => {
      const conns = [
        { source: 'A', target: 'A' }
      ];
      const result = detectCyclicDependencies(conns);
      expect(result.hasCycle).toBe(true);
      expect(result.cycle).toEqual(['A', 'A']);
    });
  });

});
