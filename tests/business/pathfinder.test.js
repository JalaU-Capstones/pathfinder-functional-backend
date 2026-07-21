const { calculatePath } = require('../../src/business/pathfinder');

describe('Pathfinder Placeholder', () => {
  it('should compute Manhattan distance correctly for a valid path', () => {
    const grid = { width: 10, height: 10 };
    const start = { x: 2, y: 2 };
    const end = { x: 8, y: 5 };
    const obstacles = [];
    const waypoints = [];

    const result = calculatePath(grid, start, end, obstacles, waypoints);

    expect(result).toHaveProperty('distance');
    expect(result).toHaveProperty('path');
    
    // Manhattan distance: |8 - 2| + |5 - 2| = 6 + 3 = 9
    expect(result.distance).toBe(9);
    expect(result.path).toEqual([{ x: 2, y: 2 }, { x: 8, y: 5 }]);
  });

  it('should return 0 distance when start and end are the same', () => {
    const grid = { width: 10, height: 10 };
    const start = { x: 5, y: 5 };
    const end = { x: 5, y: 5 };
    const obstacles = [];
    const waypoints = [];

    const result = calculatePath(grid, start, end, obstacles, waypoints);

    expect(result.distance).toBe(0);
    expect(result.path).toEqual([{ x: 5, y: 5 }, { x: 5, y: 5 }]);
  });

  it('should return a frozen immutable result object', () => {
    const grid = { width: 10, height: 10 };
    const start = { x: 2, y: 2 };
    const end = { x: 8, y: 8 };

    const result = calculatePath(grid, start, end, [], []);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.path)).toBe(true);
  });
});
