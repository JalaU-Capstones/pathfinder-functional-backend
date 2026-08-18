'use strict';

/**
 * @fileoverview Pure accumulator functions for the
 * Pathfinder backend.
 *
 * Accumulators process a collection by carrying a running
 * value (the accumulator) through each element using
 * Array.prototype.reduce. They are the functional
 * alternative to imperative loops with mutable state.
 *
 * Assignment 7.4 context:
 * - Point 2: accumulate reachability from start to waypoints.
 * - Point 4: accumulate all possible routes and count them.
 * - Point 5: accumulate distances and select optimal route.
 * - Point 7: accumulate pathfinding results for large maps.
 */

/**
 * accumulateReachability - uses reduce to accumulate
 * reachability results for each stopping point from
 * the start. For each stopping point, runs pathfinding
 * and accumulates whether it is reachable or not.
 *
 * The accumulator pattern: start with { reachable: [],
 * unreachable: [] } and reduce over stopping points,
 * appending each to the appropriate array.
 *
 * @param {[number,number]} startPoint - [x, y] start.
 * @param {Array<[number,number]>} stoppingPoints - Targets.
 * @param {Array} obstacles - Obstacle positions.
 * @param {{ width: number, height: number }} grid
 * @param {Function} pathFinder - Pure pathfinding function.
 *   Signature: (grid, start, end, obstacles, waypoints)
 *   Returns: { distance: number, path: Array }
 * @returns {{ reachable: Array, unreachable: Array }}
 */
const accumulateReachability = (
  startPoint,
  stoppingPoints,
  obstacles,
  grid,
  pathFinder,
) =>
  stoppingPoints.reduce(
    (acc, point) => {
      const start = { x: startPoint[0], y: startPoint[1] };
      const end = { x: point[0], y: point[1] };
      const result = pathFinder(grid, start, end, obstacles, []);

      if (result.distance === -1) {
        return {
          ...acc,
          unreachable: [...acc.unreachable, point],
        };
      }
      return {
        ...acc,
        reachable: [...acc.reachable, point],
      };
    },
    { reachable: [], unreachable: [] }
  );

/**
 * accumulateAllRoutes - accumulates all valid routes
 * between the start and each stopping point. Uses reduce
 * to build a collection of route results, filtering out
 * unreachable destinations.
 *
 * @param {[number,number]} startPoint
 * @param {Array<[number,number]>} stoppingPoints
 * @param {Array} obstacles
 * @param {{ width: number, height: number }} grid
 * @param {Function} pathFinder
 * @returns {{ routes: Array, routesCount: number }}
 */
const accumulateAllRoutes = (
  startPoint,
  stoppingPoints,
  obstacles,
  grid,
  pathFinder,
) => {
  const routes = stoppingPoints.reduce((acc, point) => {
    const start = { x: startPoint[0], y: startPoint[1] };
    const end = { x: point[0], y: point[1] };
    const result = pathFinder(grid, start, end, obstacles, []);

    if (result.distance === -1) return acc;

    return [
      ...acc,
      {
        destination: point,
        distance: result.distance,
        path: result.path,
      },
    ];
  }, []);

  return { routes, routesCount: routes.length };
};

/**
 * accumulateOptimalRoute - uses a pipe of reduce operations
 * to calculate all route distances and select the shortest.
 *
 * Pipeline:
 * 1. Accumulate all valid routes with distances (reduce).
 * 2. Filter out unreachable destinations (filter).
 * 3. Reduce to find the minimum distance route.
 *
 * This is the "pipe of accumulators" pattern: each step
 * processes the output of the previous one using a
 * different functional operator.
 *
 * @param {[number,number]} startPoint
 * @param {Array<[number,number]>} stoppingPoints
 * @param {Array} obstacles
 * @param {{ width: number, height: number }} grid
 * @param {Function} pathFinder
 * @returns {{ optimal: boolean, optimalRoute: Array,
 *             distance: number } | { optimal: false }}
 */
const accumulateOptimalRoute = (
  startPoint,
  stoppingPoints,
  obstacles,
  grid,
  pathFinder,
) => {
  // Step 1: accumulate all candidate routes
  const { routes } = accumulateAllRoutes(
    startPoint, stoppingPoints, obstacles, grid, pathFinder
  );

  // Step 2: filter to reachable routes only
  const reachable = routes.filter((r) => r.distance > 0);

  if (reachable.length === 0) {
    return { optimal: false, optimalRoute: [], distance: -1 };
  }

  // Step 3: reduce to find minimum distance route
  const optimal = reachable.reduce(
    (best, current) =>
      current.distance < best.distance ? current : best,
    reachable[0]
  );

  return {
    optimal: true,
    optimalRoute: [
      startPoint,
      ...optimal.path.map((p) => [p.x, p.y]),
    ],
    distance: optimal.distance,
  };
};

/**
 * accumulateLargeMapResults - processes large maps by
 * accumulating pathfinding results using a memoized
 * pathfinder. The memoization prevents recomputing paths
 * to stopping points that share sub-paths.
 *
 * Combines: accumulator (reduce) + memoization (cache)
 * to handle maps with many obstacles and stopping points
 * efficiently.
 *
 * @param {[number,number]} startPoint
 * @param {Array<[number,number]>} stoppingPoints
 * @param {Array} obstacles
 * @param {{ width: number, height: number }} grid
 * @param {Function} memoizedPathFinder - A memoized version
 *   of the pathfinding function.
 * @returns {{ canHandleLargeMap: boolean,
 *             processed: number, reached: number }}
 */
const accumulateLargeMapResults = (
  startPoint,
  stoppingPoints,
  obstacles,
  grid,
  memoizedPathFinder,
) => {
  const result = stoppingPoints.reduce(
    (acc, point) => {
      const start = { x: startPoint[0], y: startPoint[1] };
      const end = { x: point[0], y: point[1] };
      const pathResult = memoizedPathFinder(
        grid, start, end, obstacles, []
      );

      return {
        processed: acc.processed + 1,
        reached:
          pathResult.distance !== -1
            ? acc.reached + 1
            : acc.reached,
      };
    },
    { processed: 0, reached: 0 }
  );

  return {
    canHandleLargeMap: true,
    processed: result.processed,
    reached: result.reached,
    message:
      'Algorithm successfully handled a map with a large ' +
      'number of obstacles and stopping points.',
  };
};

module.exports = {
  accumulateReachability,
  accumulateAllRoutes,
  accumulateOptimalRoute,
  accumulateLargeMapResults,
};
