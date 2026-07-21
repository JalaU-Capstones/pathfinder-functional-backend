/**
 * Calculates the optimal path between two points on a grid.
 * 
 * THIS IS A PLACEHOLDER. The real pathfinding algorithm (to be determined
 * by the course rubric) will be implemented in Phase 5B inside this exact
 * function. No other file will need to change when that happens.
 *
 * @param {Object} grid - The map grid: { width, height }
 * @param {Object} start - Start coordinates: { x, y }
 * @param {Object} end - End coordinates: { x, y }
 * @param {Array}  obstacles - Array of obstacle positions: [{ x, y }]
 * @param {Array}  waypoints - Array of waypoints the route must pass through:
 *                             [{ x, y, name }] (may be empty)
 * @returns {Object} - { distance: number, path: Array<{x, y}> }
 */
// eslint-disable-next-line no-unused-vars
const calculatePath = (grid, start, end, obstacles, waypoints) => {
  // PHASE 5B: Replace this placeholder with the real algorithm.
  // Candidate algorithms (decision pending course rubric):
  //   - A* (recommended): optimal for weighted grids with heuristics
  //   - Dijkstra: optimal for shortest path in non-negative weighted graphs
  //   - BFS: optimal for unweighted grids
  // The chosen algorithm will be implemented here without changing the
  // function signature or any other file.
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const placeholderDistance = dx + dy; // Manhattan distance as temporary approximation
  const placeholderPath = [start, end]; // Direct path, ignoring obstacles for now

  return Object.freeze({
    distance: placeholderDistance,
    path: Object.freeze(placeholderPath),
  });
};

module.exports = { calculatePath };
