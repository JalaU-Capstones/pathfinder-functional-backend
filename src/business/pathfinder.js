/**
 * Calculates the optimal path between two points on a grid using A* algorithm.
 *
 * @param {Object} grid - The map grid: { width, height }
 * @param {Object} start - Start coordinates: { x, y }
 * @param {Object} end - End coordinates: { x, y }
 * @param {Array}  obstacles - Array of obstacle positions: [{ x, y }]
 * @param {Array}  waypoints - Array of waypoints the route must pass through:
 *                             [{ x, y, name }] (may be empty)
 * @returns {Object} - { distance: number, path: Array<{x, y}> }
 */
const calculatePath = (grid, start, end, obstacles, waypoints) => {
  // If there are waypoints, delegate to the sequential pathfinder.
  // This cleanly separates the single-segment A* logic from the multi-segment routing logic.
  if (waypoints && waypoints.length > 0) {
    return calculatePathWithWaypoints(grid, start, end, obstacles, waypoints);
  }

  return calculateSinglePath(grid, start, end, obstacles);
};

/**
 * Calculates a sequential path through multiple waypoints.
 * 
 * Why: This function breaks down a complex route (start -> wp1 -> wp2 -> end) 
 * into smaller, independent A* calculations (start -> wp1, wp1 -> wp2, etc.).
 * This functional approach avoids modifying the core A* algorithm to handle multiple targets.
 */
const calculatePathWithWaypoints = (grid, start, end, obstacles, waypoints) => {
  // Construct the full sequence of points to visit in order
  const points = [start, ...waypoints, end];
  
  let totalDistance = 0;
  let fullPath = [];

  for (let i = 0; i < points.length - 1; i++) {
    const segmentStart = points[i];
    const segmentEnd = points[i + 1];

    // Calculate the shortest path for the current segment
    const segmentResult = calculateSinglePath(grid, segmentStart, segmentEnd, obstacles);

    // If any segment is blocked, the entire route is impossible
    if (segmentResult.distance === -1) {
      return Object.freeze({ distance: -1, path: Object.freeze([]) });
    }

    totalDistance += segmentResult.distance;

    // Deduplicate the boundary point:
    // The end of segment 1 is the same as the start of segment 2.
    // If we are not on the first segment, we slice off the first point to avoid repeating it.
    const pathToAdd = i === 0 ? segmentResult.path : segmentResult.path.slice(1);
    fullPath = [...fullPath, ...pathToAdd];
  }

  return Object.freeze({
    distance: totalDistance,
    path: Object.freeze(fullPath)
  });
};

/**
 * Calculates the shortest path between a single start and end point using the A* algorithm.
 * 
 * Why A*: It guarantees the shortest path (unlike Greedy BFS) while exploring far fewer nodes
 * than Dijkstra by using a heuristic to guide the search towards the target.
 */
const calculateSinglePath = (grid, start, end, obstacles) => {
  // Edge case: if start and end are the same point, distance is 0.
  if (start.x === end.x && start.y === end.y) {
    return Object.freeze({ distance: 0, path: Object.freeze([start]) });
  }

  // Convert obstacles to a Set of string coordinates for O(1) lookup
  // Why: Checking an array of objects `[{x, y}]` is O(N). A Set of 'x,y' strings is O(1).
  const obstacleSet = new Set();
  for (const obs of obstacles) {
    const startX = obs.startX !== undefined ? obs.startX : obs.x;
    const startY = obs.startY !== undefined ? obs.startY : obs.y;
    const endX = obs.endX !== undefined ? obs.endX : startX;
    const endY = obs.endY !== undefined ? obs.endY : startY;

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        obstacleSet.add(`${x},${y}`);
      }
    }
  }

  // The set of discovered nodes that may need to be (re-)expanded.
  // We use a simple array because the map sizes are small (<= 100x100).
  // Why tradeoff: A proper Min-Heap provides O(log N) extraction, but for grids of this size,
  // the functional purity and simplicity of an array often outweighs the overhead of a complex Heap implementation.
  let openSet = [start];

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start to n currently known.
  // Why: This map allows us to reconstruct the final path by walking backwards from the end to the start.
  // We use a Map keyed by 'x,y' strings because JS objects/Maps evaluate object equality by reference, not by value.
  const cameFrom = new Map();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  // Why: It keeps track of the actual distance traveled so far. If a node is reached via a shorter path, we update it.
  const gScore = new Map();
  gScore.set(`${start.x},${start.y}`, 0);

  // For node n, fScore[n] = gScore[n] + h(n, end).
  // fScore[n] represents our current best guess as to how short a path from start to finish can be if it goes through n.
  // Why: The open set is sorted based on fScore, so A* always explores the most promising nodes first.
  const fScore = new Map();
  fScore.set(`${start.x},${start.y}`, heuristic(start, end));

  while (openSet.length > 0) {
    // Pick the node in openSet having the lowest fScore[] value.
    // Why: This ensures we prioritize nodes that are theoretically closest to the end (guided by the heuristic).
    // Using a simple array sort/min-find here; acceptable for small grids.
    let currentIndex = 0;
    let lowestFScore = Infinity;
    for (let i = 0; i < openSet.length; i++) {
      const nodeStr = `${openSet[i].x},${openSet[i].y}`;
      const f = fScore.has(nodeStr) ? fScore.get(nodeStr) : Infinity;
      if (f < lowestFScore) {
        lowestFScore = f;
        currentIndex = i;
      }
    }

    const current = openSet[currentIndex];
    const currentStr = `${current.x},${current.y}`;

    // If we reached the end, reconstruct and return the path
    if (current.x === end.x && current.y === end.y) {
      const path = reconstructPath(cameFrom, current);
      return Object.freeze({
        distance: gScore.get(currentStr), // Distance is simply the accumulated g-score
        path: Object.freeze(path)
      });
    }

    // Remove current from openSet
    // Why: We are expanding this node, so we shouldn't expand it again unless we find a cheaper path to it.
    openSet = openSet.filter((_, idx) => idx !== currentIndex);

    const neighbors = getNeighbors(current, grid, obstacleSet);

    for (const neighbor of neighbors) {
      const neighborStr = `${neighbor.x},${neighbor.y}`;
      
      // The distance from start to a neighbor is the distance to current + 1 (since cost between adjacent cells is 1)
      const tentativeGScore = gScore.get(currentStr) + 1;

      const currentGScoreForNeighbor = gScore.has(neighborStr) ? gScore.get(neighborStr) : Infinity;

      // If this path to neighbor is better than any previous one. Record it!
      if (tentativeGScore < currentGScoreForNeighbor) {
        // This path is the best until now. Record it!
        // Why: We update cameFrom and scores so that future calculations use this newly discovered shorter route.
        cameFrom.set(neighborStr, current);
        gScore.set(neighborStr, tentativeGScore);
        fScore.set(neighborStr, tentativeGScore + heuristic(neighbor, end));

        // If neighbor not in openSet, add it
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  // Open set is empty but end was never reached -> no path exists (start or end is completely blocked off)
  return Object.freeze({ distance: -1, path: Object.freeze([]) });
};

/**
 * Calculates the Manhattan distance between two points.
 * 
 * Why Manhattan over Euclidean: Since movement is restricted to 4 directions (no diagonals),
 * the exact minimum distance between any two unblocked points is simply the sum of horizontal
 * and vertical differences. Using Euclidean distance would underestimate the true path cost.
 * Why admissible: It never overestimates the actual shortest path cost in a 4-directional grid.
 */
const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/**
 * Generates the valid, walkable adjacent neighbors for a given node.
 * 
 * Why: A* needs to know where it can move from the current cell. This function enforces
 * the 4-directional movement rule and ensures we don't step out of bounds or into obstacles.
 */
const getNeighbors = (node, grid, obstacleSet) => {
  // 4-directional movement (up, down, left, right)
  const DIRECTIONS = Object.freeze([
    Object.freeze({ x: 0, y: -1 }), // up
    Object.freeze({ x: 0, y: 1 }),  // down
    Object.freeze({ x: -1, y: 0 }), // left
    Object.freeze({ x: 1, y: 0 }),  // right
  ]);

  const neighbors = [];
  
  for (const dir of DIRECTIONS) {
    const nx = node.x + dir.x;
    const ny = node.y + dir.y;
    
    // Check boundaries: x between 0 and width-1, y between 0 and height-1
    if (nx >= 0 && nx < grid.width && ny >= 0 && ny < grid.height) {
      // Check if the cell is an obstacle
      if (!obstacleSet.has(`${nx},${ny}`)) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  
  return neighbors;
};

/**
 * Reconstructs the final path by backtracking from the destination node to the start node.
 * 
 * Why: The A* algorithm stores reverse links (cameFrom) as it explores. 
 * Once the target is found, we follow these links backwards to build the sequence of coordinates.
 */
const reconstructPath = (cameFrom, current) => {
  const path = [current];
  let currentStr = `${current.x},${current.y}`;
  
  while (cameFrom.has(currentStr)) {
    const previous = cameFrom.get(currentStr);
    path.unshift(previous); // Prepend to build the path from start to end
    currentStr = `${previous.x},${previous.y}`;
  }
  
  return path;
};

module.exports = { calculatePath };
