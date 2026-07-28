# Assignment 3.4 — Capstone Progress Report
**Project:** Pathfinder Functional Backend
**Student:** Diego Alejandro Botina
**GitHub:** https://github.com/JalaU-Capstones/pathfinder-functional-backend
**Deliverable Branch (Assignment 3.4):**
https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/assigment3-4
**Period:** July 20, 2026 – July 27, 2026
**Course:** Programming 4 — Jala University

> **Note:** The specific code and requirements delivered for
> Assignment 3.4 have been frozen and can be reviewed in the
> dedicated branch:
> [deliverable/assigment3-4](https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/assigment3-4).
> This branch was created from `main` after all phases of this
> assignment were merged, to preserve a snapshot of the work
> delivered for this period while allowing the project to continue
> evolving on `main`.

## Section 1 — Introduction
Assignment 3.4 required applying functional programming techniques (higher-order functions, currying, and function composition) to implement specific business logic. Specifically, this period focused on the pathfinding algorithm, the route validation pipeline, map configuration verification, and waypoint compliance checking. This assignment built directly on the CRUD foundation delivered in Assignment 2.4, transforming the baseline entity management into a fully functional routing system.

## Section 2 — What Was Implemented This Period

| Phase | Feature | Status |
|---|---|---|
| 5B | A* pathfinding algorithm implementation | ✅ Complete |
| 8 | Functional techniques: HOF, currying, composition | ✅ Complete |
| 9 | Route enrichment: persist and return `optimal_path` | ✅ Complete |
| 9 | Waypoint compliance validation (rubric point 6) | ✅ Complete |
| 9 | New migration: `path` JSONB column in Routes table | ✅ Complete |
| 10 | Postman collection updated with new Route responses | ✅ Complete |

## Section 3 — Algorithm: A* Implementation

**Why A* was chosen:**
1. **Optimality with heuristics:** A* finds the guaranteed shortest path while using a heuristic (Manhattan distance for grid maps) to explore far fewer nodes than other search algorithms.
2. **Grid suitability:** The map model has integer `width`/`height` dimensions and obstacles at discrete `x`/`y` positions, which is exactly the domain A* was designed for.
3. **Functional implementation:** A* can be implemented as a pure function with no shared mutable state. The open set, closed set, and g-scores are local to the function call, making it a natural fit for the functional paradigm.
4. **Waypoint support:** A* can be extended to handle ordered waypoints by running the algorithm sequentially between each pair of points and concatenating the path segments, mapping cleanly to functional composition.
5. **Vs. Dijkstra:** Dijkstra explores all directions equally and finds shortest paths to ALL nodes, which is unnecessary here since we have a specific destination and a heuristic available.
6. **Vs. BFS:** BFS is optimal only for unweighted graphs; it ignores potential movement costs and has no heuristic guidance, making it less efficient than A* on larger maps.

**How it works in this project:**
The `calculatePath` function in `src/business/pathfinder.js` executes the algorithm. It initializes the open set with the start node, tracking known costs (`gScore`) and estimated costs (`fScore`). While the open set has nodes, it picks the node with the lowest `fScore`. If this node is the destination, it reconstructs the path by walking backwards. Otherwise, it explores valid neighbors (within bounds, not obstacles), calculating tentative `gScore`s and updating the open set if a better path to the neighbor is found.

**Heuristic:**
The algorithm uses the Manhattan distance, which is the sum of the absolute differences of the x and y coordinates. Because movement on our grid is strictly 4-directional, Manhattan distance is an *admissible* heuristic (it never overestimates the actual shortest path cost), guaranteeing that A* finds the optimal path. Euclidean distance would underestimate the cost and be less efficient.

**Waypoint handling:**
The `calculatePathWithWaypoints` function runs A* sequentially between each checkpoint pair (e.g., start -> waypoint 1 -> waypoint 2 -> end) and concatenates the resulting path segments, removing duplicate boundary points.

For full algorithm documentation, see: [../../../architecture/pathfinding-algorithm.md](../../../architecture/pathfinding-algorithm.md)

## Section 4 — Functional Programming Techniques Applied

**Higher-Order Functions:**
A higher-order function takes a function as an argument or returns a function. 
- `requireNonEmpty(fieldName)` in `src/utils/routeValidators.js`: Takes a string and returns a validator function to verify map array fields.
- Array methods like `.map()`, `.filter()`, `.every()`, and `.some()` are used throughout the service layer for data transformation without mutation.

**Currying:**
Currying transforms a function with multiple arguments into a sequence of functions, each taking a single argument.
- A `curry` utility is implemented in `src/utils/curry.js`.
- `isPointInGrid(grid)(point)`: Pre-loads the grid context so the same validator is reused for both start and end point validations efficiently.
- `isSamePoint(a)(b)` and `isWithinBound(max)(value)` are other curried functions used.

**Function Composition:**
Composition combines multiple simple functions to build a more complex one.
- `pipe` and `compose` utilities are implemented in `src/utils/compose.js`.
- The `validateRouteContext` pipeline in `src/business/services/routeService.js` is built using a `pipe`: `validateMapExists → validateMapHasObstacles → validateStartInBounds → validateEndInBounds → validatePointsNotEqual`.
- **Before (If-chain):**
  ```javascript
  if (!map) throw ...
  if (!map.obstacles.length) throw ...
  if (!inBounds(start)) throw ...
  // ...
  ```
- **After (Pipe):**
  ```javascript
  const validateRouteContext = pipe(
    validateMapExists,
    validateMapHasObstacles,
    validateStartInBounds,
    validateEndInBounds,
    validatePointsNotEqual
  );
  ```

For full documentation, see: [../../../architecture/functional-techniques.md](../../../architecture/functional-techniques.md)

## Section 5 — Rubric Requirements Mapping

| Rubric Point | Description | Implementation |
|---|---|---|
| 1 | Validate map_id, start, end exist in DB | `validateMapExists` + bounds check in `src/utils/routeValidators.js` via `pipe` in `routeService.js` |
| 2 | Verify map has obstacles and waypoints | `requireNonEmpty('obstacles')` + `requireNonEmpty('waypoints')` HOF in `src/utils/routeValidators.js` |
| 3 | Implement A*, Dijkstra, or BFS | A* in `src/business/pathfinder.js` |
| 4 | Traverse map avoiding obstacles, passing waypoints | `calculatePathWithWaypoints` + obstacle set in A* neighbor check |
| 5 | Calculate optimal path with distance and duration | `distance` from A* step count; `optimal_path` returned and persisted |
| 6 | Validate path passes through all waypoints | `validateWaypointsInPath` in `src/utils/routeValidators.js`, 422 on failure |
| 7 | Integrate with CRUD operations | `POST /api/routes` persists path+distance; `GET /api/routes/:id` retrieves stored path |
| 8 | Postman collection | `.docs/collections/postman/pathfinder-api.postman_collection.json` |

## Section 6 — Schema Evolution
This period introduced a database schema evolution.
- **Migration file:** `src/data/migrations/20260727000000-add-path-to-routes.js`
- **Column added:** `path` (JSONB, nullable) to the `Routes` table.
- **Why a new migration:** Migrations represent immutable history. Editing an existing, already deployed migration is a destructive practice that breaks reproducibility and consistency across environments. Adding a new file ensures the schema changes progressively.
- **Why JSONB:** JSONB provides structured binary storage, is auto-serialized by Sequelize, and enables future indexed queries on the path coordinate array.

## Section 7 — Design Patterns Applied This Period
- **Strategy Pattern:** Implemented initially as a stub in Phase 5A, the real A* algorithm was swapped into `src/business/pathfinder.js` in Phase 5B with zero changes required in any consuming layer (service or controller).
- **Pipeline Pattern:** Applied in Phase 8 to construct the route validation sequence using the `pipe` composition utility, moving away from procedural `if-throw` statements.

For pattern documentation, see:
- [Strategy Pattern](../../../pattern-design/strategy-pattern.md)
- [Pipeline Pattern](../../../pattern-design/pipeline-pattern.md)

## Section 8 — API Changes This Period

| Entity | Method | Path | What Changed |
|---|---|---|---|
| Routes | POST | /api/routes | Response now includes `optimal_path` array; 422 added for waypoint failure |
| Routes | GET | /api/routes/:id | Response now includes `optimal_path` from DB |
| Routes | GET | /api/routes | Each item now includes `optimal_path` |

*(All other endpoints for Maps, Obstacles, Waypoints, Users, and Health remain unchanged from Assignment 2.4).*

## Section 9 — AI-Assisted Development
Development during this assignment period continued with the same AI-assisted workflow established in Assignment 2.4.

**Claude (Anthropic)** continued as technical advisor and prompt architect. For this period, Claude's contributions included: selecting A* as the pathfinding algorithm and documenting the decision against Dijkstra, BFS, and DFS alternatives; designing the functional technique integration strategy (where to apply HOF, currying, and composition meaningfully rather than cosmetically); specifying the validation pipeline architecture (railway-oriented style with `pipe`); and defining the schema evolution strategy for the `path` column (new migration, JSONB type, nullable for backward compatibility).

**Gemini 2.5 Flash (Google)** executed the implementation prompts: it implemented the A* algorithm in `pathfinder.js`, created the `pipe`/`compose`/`curry` utilities, refactored the route validation into a composed pipeline, created the new migration file, and updated the Postman collection.

All output was reviewed, tested (`npm test` with zero failures), and validated by the student before being committed. Every architectural decision reflected here was made deliberately before any code was written.

## Section 10 — Conclusion

**Assignment 3.4:** All 8 rubric requirements are satisfied. The A* algorithm is implemented as a pure function with Manhattan distance heuristic, supporting obstacle avoidance and ordered waypoint traversal. The three functional programming techniques (HOF, currying, composition) are applied meaningfully in the validation pipeline and utility layer, not as cosmetic additions. The route's computed path is persisted via a new, reversible migration and returned in every route response as `optimal_path`.

**Overall capstone (current state):** The project is now functionally complete for the requirements delivered through Assignment 3.4. The codebase is clean, consistently structured, thoroughly documented, and tested. The single responsibility principle ensures every behavior has exactly one location in the code — a property that has been verified across 70+ files. Outstanding work: any new requirements from upcoming assignments before the September 4, 2026 deadline.
