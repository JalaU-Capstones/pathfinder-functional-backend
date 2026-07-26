# Pathfinding Algorithm — A* Implementation

## Algorithm Selection
### Why A*
1. **Optimality with heuristics:** A* finds the guaranteed shortest path while using a heuristic (Manhattan distance for grid maps) to explore far fewer nodes than Dijkstra or BFS, making it the most efficient choice for a 2D grid with x/y coordinates.
2. **Grid suitability:** The map model has integer `width`/`height` dimensions and obstacles at discrete `x`/`y` positions — exactly the domain A* was designed for.
3. **Functional implementation:** A* can be implemented as a pure function with no shared mutable state — the open set, closed set, and g-scores are all local to the function call, making it a natural fit for the functional paradigm of this project.
4. **Waypoint support:** A* can be extended to handle ordered waypoints by running the algorithm sequentially between each pair of points (start→waypoint1→waypoint2→end) and concatenating the path segments — this maps cleanly to functional composition.

### Why not Dijkstra
5. **Vs. Dijkstra:** Dijkstra explores all directions equally and finds shortest paths to ALL nodes — unnecessary here since we have a specific destination and a heuristic available.

### Why not BFS
6. **Vs. BFS:** BFS is optimal only for unweighted graphs; it ignores potential movement costs and has no heuristic guidance, making it less efficient than A* on larger maps.

### Why not DFS
**Vs. DFS:** Depth-First Search does not guarantee finding the shortest path at all. It will blindly dive into a path until it hits a dead end or the target, which is unacceptable for a routing application that requires optimal paths.

## How A* Works (step by step)
1. Initialize the open set with the start node, setting its known cost from the start (`gScore`) to 0, and its estimated total cost (`fScore`) to the heuristic distance from the start to the end.
2. While the open set is not empty:
   a. Pick the node from the open set with the lowest `fScore` (lowest `g + h`).
   b. If this node is the destination, reconstruct the path by walking backwards through the recorded steps (`cameFrom` map) and return the path.
   c. For each valid neighbor of the current node (within bounds, not an obstacle):
      i. Calculate the tentative `gScore` for the neighbor (current `gScore` + 1).
      ii. If this tentative `gScore` is lower than the neighbor's previously known `gScore` (or if it hasn't been visited yet), update its `gScore`, its `fScore`, and record the current node as its predecessor.
      iii. Add the neighbor to the open set if it is not already there.
3. If the open set empties completely without finding the destination, return a result indicating no path exists (distance -1).

## Heuristic: Manhattan Distance
Manhattan distance is calculated as the sum of the absolute differences of the x and y coordinates (`|x1 - x2| + |y1 - y2|`). 
It was chosen because movement on our grid is strictly 4-directional (up, down, left, right) with no diagonals. In such a grid, the true minimum cost between any two points without obstacles is exactly the Manhattan distance. It is an *admissible* heuristic because it never overestimates the actual shortest path cost, guaranteeing that A* will find the optimal path. Euclidean distance (straight-line distance) would underestimate the cost on a 4-directional grid, making the search less efficient.

## Waypoint Strategy
To support waypoints, the pathfinding logic is split into a multi-segment router (`calculatePathWithWaypoints`).
It treats the start, the sequence of waypoints, and the end as a single ordered array of points to visit. It then runs the core A* algorithm sequentially between each pair of adjacent points in the array (e.g., start to waypoint 1, waypoint 1 to waypoint 2, etc.).
The results of each segment are concatenated to form the final path, deduplicating the boundary points (where the end of one segment is the start of the next). 
This approach was chosen because it cleanly separates the A* core logic from the multi-target routing logic, adhering to functional principles by composing smaller pure function calls.

## Functional Implementation Notes
The algorithm was carefully adapted to fit the functional paradigm of the project:
- **No shared mutable state:** All intermediate data structures (`openSet`, `gScore`, `fScore`, `cameFrom`) are instantiated locally inside the `calculateSinglePath` function call.
- **Pure helper functions:** Helpers like `heuristic`, `getNeighbors`, and `reconstructPath` depend only on their inputs.
- **Immutability:** Input parameters are never mutated. The final returned object and its inner `path` array are strictly sealed using `Object.freeze()`.

## Complexity Analysis
- **Time:** O((V + E) log V) if implemented with a proper priority queue, where V is the number of grid cells and E is the number of valid moves. Since we use a simple array for the open set (an acceptable tradeoff for small grids), extraction is O(V), making the worst-case time complexity O(V^2). 
- **Space:** O(V) to store the open set, g-scores, and the came-from map.
- **For a 100x100 grid:** V = 10,000. Even with an O(V^2) array-based search, the number of operations is well within real-time constraints for a Node.js backend.

## Where It Is Implemented
- Algorithm: `src/business/pathfinder.js`
- Called by: `src/business/services/routeService.js`
- Tests: `tests/business/pathfinder.test.js`
