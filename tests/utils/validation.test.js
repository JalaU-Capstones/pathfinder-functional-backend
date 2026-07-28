const { isValidObstacle, isValidWaypoint } = require('../../src/utils/validation');

describe('validation utils', () => {
  describe('isValidObstacle', () => {
    it('should return true for a valid obstacle', () => {
      expect(isValidObstacle({ position: { x: 10, y: 20 }, size: 5 })).toBe(true);
    });

    it('should return false if obstacle is not an object', () => {
      expect(isValidObstacle(null)).toBe(false);
      expect(isValidObstacle('string')).toBe(false);
    });

    it('should return false if position is missing or invalid', () => {
      expect(isValidObstacle({ size: 5 })).toBe(false);
      expect(isValidObstacle({ position: 'invalid', size: 5 })).toBe(false);
    });

    it('should return false if position.x is missing or invalid', () => {
      expect(isValidObstacle({ position: { y: 20 }, size: 5 })).toBe(false);
      expect(isValidObstacle({ position: { x: -1, y: 20 }, size: 5 })).toBe(false);
      expect(isValidObstacle({ position: { x: '10', y: 20 }, size: 5 })).toBe(false);
    });

    it('should return false if position.y is missing or invalid', () => {
      expect(isValidObstacle({ position: { x: 10 }, size: 5 })).toBe(false);
      expect(isValidObstacle({ position: { x: 10, y: -20 }, size: 5 })).toBe(false);
      expect(isValidObstacle({ position: { x: 10, y: '20' }, size: 5 })).toBe(false);
    });

    it('should return false if size is missing or invalid', () => {
      expect(isValidObstacle({ position: { x: 10, y: 20 } })).toBe(false);
      expect(isValidObstacle({ position: { x: 10, y: 20 }, size: -5 })).toBe(false);
      expect(isValidObstacle({ position: { x: 10, y: 20 }, size: 0 })).toBe(false);
      expect(isValidObstacle({ position: { x: 10, y: 20 }, size: '5' })).toBe(false);
    });
  });

  describe('isValidWaypoint', () => {
    it('should return true for a valid waypoint', () => {
      expect(isValidWaypoint({ position: { x: 10, y: 20 }, name: 'Start' })).toBe(true);
    });

    it('should return false if waypoint is not an object', () => {
      expect(isValidWaypoint(null)).toBe(false);
      expect(isValidWaypoint('string')).toBe(false);
    });

    it('should return false if position is missing or invalid', () => {
      expect(isValidWaypoint({ name: 'Start' })).toBe(false);
      expect(isValidWaypoint({ position: 'invalid', name: 'Start' })).toBe(false);
    });

    it('should return false if position.x is missing or invalid', () => {
      expect(isValidWaypoint({ position: { y: 20 }, name: 'Start' })).toBe(false);
      expect(isValidWaypoint({ position: { x: -1, y: 20 }, name: 'Start' })).toBe(false);
    });

    it('should return false if position.y is missing or invalid', () => {
      expect(isValidWaypoint({ position: { x: 10 }, name: 'Start' })).toBe(false);
      expect(isValidWaypoint({ position: { x: 10, y: -20 }, name: 'Start' })).toBe(false);
    });

    it('should return false if name is missing or invalid', () => {
      expect(isValidWaypoint({ position: { x: 10, y: 20 } })).toBe(false);
      expect(isValidWaypoint({ position: { x: 10, y: 20 }, name: '' })).toBe(false);
      expect(isValidWaypoint({ position: { x: 10, y: 20 }, name: '   ' })).toBe(false);
      expect(isValidWaypoint({ position: { x: 10, y: 20 }, name: 123 })).toBe(false);
    });
  });
});
