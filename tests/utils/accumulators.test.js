/* global jest */

const {
  accumulateReachability,
  accumulateAllRoutes,
  accumulateOptimalRoute,
  accumulateLargeMapResults,
} = require('../../src/utils/accumulators');

describe('accumulators util', () => {
  describe('accumulateReachability', () => {
    it('returns unreachable: [] when all reachable', () => {
      const pathFinder = jest.fn().mockReturnValue({ distance: 10, path: [] });
      const startPoint = [0, 0];
      const stoppingPoints = [[1, 1], [2, 2]];
      const obstacles = [];
      const grid = { width: 10, height: 10 };

      const result = accumulateReachability(startPoint, stoppingPoints, obstacles, grid, pathFinder);
      expect(result.unreachable).toEqual([]);
      expect(result.reachable).toEqual(stoppingPoints);
      expect(pathFinder).toHaveBeenCalledTimes(2);
    });

    it('splits correctly when some are unreachable', () => {
      const pathFinder = jest.fn()
        .mockReturnValueOnce({ distance: 10, path: [] })
        .mockReturnValueOnce({ distance: -1, path: [] });
      
      const startPoint = [0, 0];
      const stoppingPoints = [[1, 1], [2, 2]];
      const obstacles = [];
      const grid = { width: 10, height: 10 };

      const result = accumulateReachability(startPoint, stoppingPoints, obstacles, grid, pathFinder);
      expect(result.reachable).toEqual([[1, 1]]);
      expect(result.unreachable).toEqual([[2, 2]]);
      expect(pathFinder).toHaveBeenCalledTimes(2);
    });
  });

  describe('accumulateAllRoutes', () => {
    it('returns correct routesCount and excludes unreachable destinations', () => {
      const pathFinder = jest.fn()
        .mockReturnValueOnce({ distance: 10, path: [{x: 1, y: 1}] })
        .mockReturnValueOnce({ distance: -1, path: [] });

      const startPoint = [0, 0];
      const stoppingPoints = [[1, 1], [2, 2]];
      const obstacles = [];
      const grid = { width: 10, height: 10 };

      const result = accumulateAllRoutes(startPoint, stoppingPoints, obstacles, grid, pathFinder);
      expect(result.routesCount).toBe(1);
      expect(result.routes).toEqual([
        { destination: [1, 1], distance: 10, path: [{x: 1, y: 1}] }
      ]);
    });
  });

  describe('accumulateOptimalRoute', () => {
    it('returns shortest distance route', () => {
      const pathFinder = jest.fn()
        .mockReturnValueOnce({ distance: 20, path: [{x: 1, y: 1}] })
        .mockReturnValueOnce({ distance: 10, path: [{x: 2, y: 2}] });

      const startPoint = [0, 0];
      const stoppingPoints = [[1, 1], [2, 2]];
      const obstacles = [];
      const grid = { width: 10, height: 10 };

      const result = accumulateOptimalRoute(startPoint, stoppingPoints, obstacles, grid, pathFinder);
      expect(result.optimal).toBe(true);
      expect(result.distance).toBe(10);
      expect(result.optimalRoute).toEqual([[0, 0], [2, 2]]);
    });

    it('returns optimal: false if no routes reachable', () => {
      const pathFinder = jest.fn().mockReturnValue({ distance: -1, path: [] });

      const startPoint = [0, 0];
      const stoppingPoints = [[1, 1]];
      const obstacles = [];
      const grid = { width: 10, height: 10 };

      const result = accumulateOptimalRoute(startPoint, stoppingPoints, obstacles, grid, pathFinder);
      expect(result.optimal).toBe(false);
      expect(result.distance).toBe(-1);
    });
  });

  describe('accumulateLargeMapResults', () => {
    it('processes all points and counts only reachable', () => {
      const pathFinder = jest.fn()
        .mockReturnValueOnce({ distance: 10, path: [] })
        .mockReturnValueOnce({ distance: -1, path: [] })
        .mockReturnValueOnce({ distance: 5, path: [] });

      const startPoint = [0, 0];
      const stoppingPoints = [[1, 1], [2, 2], [3, 3]];
      const obstacles = [];
      const grid = { width: 10, height: 10 };

      const result = accumulateLargeMapResults(startPoint, stoppingPoints, obstacles, grid, pathFinder);
      expect(result.canHandleLargeMap).toBe(true);
      expect(result.processed).toBe(3);
      expect(result.reached).toBe(2);
      expect(result.message).toContain('Algorithm successfully handled a map with a large number of obstacles and stopping points.');
    });
  });
});
