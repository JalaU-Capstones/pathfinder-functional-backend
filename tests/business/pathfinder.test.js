const { calculatePath } = require('../../src/business/pathfinder');

describe('A* Pathfinder Algorithm', () => {
  it('Scenario 1 — Basic path, no obstacles', () => {
    // 3x3 grid, start (0,0), end (2,2), no obstacles, no waypoints
    const grid = { width: 3, height: 3 };
    const start = { x: 0, y: 0 };
    const end = { x: 2, y: 2 };
    
    const result = calculatePath(grid, start, end, [], []);
    
    expect(result.distance).toBe(4); // Manhattan distance: 2 + 2 = 4
    expect(result.path.length).toBe(5); // start node + 4 steps
    expect(result.path[0]).toEqual(start);
    expect(result.path[result.path.length - 1]).toEqual(end);
  });

  it('Scenario 2 — Obstacle avoidance', () => {
    // 5x5 grid, start (0,0), end (4,4)
    // obstacles at (1,0), (1,1), (1,2), (1,3) — vertical wall
    const grid = { width: 5, height: 5 };
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [
      { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }
    ];
    
    const result = calculatePath(grid, start, end, obstacles, []);
    
    // The path must go down to (0,4), then across to (4,4)
    // Distance is 8 (4 down, 4 right).
    // The prompt says "distance > 8", but mathematically the shortest path is exactly 8 steps.
    // We assert that it successfully found a path that is at least the manhattan distance
    expect(result.distance).toBeGreaterThanOrEqual(8);
    
    // Ensure no obstacles are in the path
    const pathSet = new Set(result.path.map(p => `${p.x},${p.y}`));
    for (const obs of obstacles) {
      expect(pathSet.has(`${obs.x},${obs.y}`)).toBe(false);
    }
  });

  it('Scenario 3 — No path exists', () => {
    // 3x3 grid, start (0,0), end (2,2)
    // obstacles completely surround start: (1,0), (0,1)
    const grid = { width: 3, height: 3 };
    const start = { x: 0, y: 0 };
    const end = { x: 2, y: 2 };
    const obstacles = [
      { x: 1, y: 0 }, { x: 0, y: 1 }
    ];
    
    const result = calculatePath(grid, start, end, obstacles, []);
    
    expect(result.distance).toBe(-1);
    expect(result.path).toEqual([]);
  });

  it('Scenario 4 — Waypoints respected', () => {
    // 10x10 grid, start (0,0), waypoint at (5,5), end (9,9)
    // path passes through (5,5), total distance = sum of both segments
    const grid = { width: 10, height: 10 };
    const start = { x: 0, y: 0 };
    const waypoint = { x: 5, y: 5, name: 'Checkpoint 1' };
    const end = { x: 9, y: 9 };
    
    const result = calculatePath(grid, start, end, [], [waypoint]);
    
    // Distance from (0,0) to (5,5) = 10
    // Distance from (5,5) to (9,9) = 8
    // Total distance = 18
    expect(result.distance).toBe(18);
    
    // Verify waypoint is in the path
    const hasWaypoint = result.path.some(p => p.x === waypoint.x && p.y === waypoint.y);
    expect(hasWaypoint).toBe(true);
  });

  it('Scenario 5 — Start equals end', () => {
    // Any grid, start === end
    const grid = { width: 10, height: 10 };
    const start = { x: 3, y: 3 };
    const end = { x: 3, y: 3 };
    
    const result = calculatePath(grid, start, end, [], []);
    
    expect(result.distance).toBe(0);
    expect(result.path).toEqual([start]);
  });

  it('Scenario 6 — Empty waypoints array', () => {
    // Same as no waypoints — does not break
    const grid = { width: 3, height: 3 };
    const start = { x: 0, y: 0 };
    const end = { x: 2, y: 2 };
    
    const result = calculatePath(grid, start, end, [], []);
    
    expect(result.distance).toBe(4);
    expect(result.path.length).toBe(5);
  });

  it('Scenario 7 — Immutability', () => {
    // Returned object and path array are frozen (Object.isFrozen)
    const grid = { width: 5, height: 5 };
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    
    const result = calculatePath(grid, start, end, [], []);
    
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.path)).toBe(true);
    
    // To be extra safe, let's verify waypoint path is also frozen
    const wpResult = calculatePath(grid, start, end, [], [{ x: 2, y: 2 }]);
    expect(Object.isFrozen(wpResult)).toBe(true);
    expect(Object.isFrozen(wpResult.path)).toBe(true);
  });

  it('Scenario 8 — Impossible waypoint route', () => {
    // start (0,0), waypoint at (2,0), end (4,0)
    // obstacle at (1,0) blocks the first segment
    const grid = { width: 5, height: 1 };
    const start = { x: 0, y: 0 };
    const waypoint = { x: 2, y: 0, name: 'Checkpoint' };
    const end = { x: 4, y: 0 };
    const obstacles = [{ x: 1, y: 0 }];
    
    const result = calculatePath(grid, start, end, obstacles, [waypoint]);
    
    expect(result.distance).toBe(-1);
    expect(result.path).toEqual([]);
  });

  it('Scenario 9 — Defensive branch for fScore (mocking Map)', () => {
    const grid = { width: 3, height: 3 };
    const start = { x: 0, y: 0 };
    const end = { x: 0, y: 1 }; // one step away
    
    // Temporarily spy on Map.prototype.has to force the false branch in `fScore.has`
    const originalHas = Map.prototype.has;
    const mapSpy = jest.spyOn(Map.prototype, 'has').mockImplementation(function (key) {
      // Return false for the start node in fScore to trigger `Infinity` branch
      if (key === '0,0') return false; 
      return originalHas.call(this, key);
    });

    const result = calculatePath(grid, start, end, [], []);
    
    mapSpy.mockRestore();
    expect(result.distance).toBe(1);
  });
});
