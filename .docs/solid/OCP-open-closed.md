# Open/Closed Principle (OCP)

**Definition:** Software entities should be open for extension, but closed for modification.

In an OOP context, OCP is often achieved via abstract classes and inheritance. In our functional project, OCP is achieved via **higher-order functions**, **function composition**, and **stable interfaces (signatures)**.

## 1. The Strategy Pattern for Pathfinding
The canonical example of OCP in this project is the pathfinding algorithm.

- `src/business/pathfinder.js` exports a `calculatePath` function with a strict signature.
- `src/business/services/routeService.js` calls `calculatePath` as a black box without knowing its internal implementation.

When Phase 5B introduced the A* algorithm to replace the initial placeholder, only the body of `calculatePath` within `pathfinder.js` was modified. There were **zero changes** required in `routeService.js`, the controllers, or the routing layer. The system was extended with complex new behavior without modifying the consumer code.

### Code Example: Strategy Interface
```javascript
// src/business/pathfinder.js
// If we want to swap A* for Dijkstra, we ONLY change this function body.
// The consumer code remains entirely closed to modification.
const calculatePath = (grid, start, end, obstacles, waypoints) => {
  if (waypoints && waypoints.length > 0) {
    return calculatePathWithWaypoints(grid, start, end, obstacles, waypoints);
  }
  return calculateSinglePath(grid, start, end, obstacles);
};
```

## 2. Function Composition (`pipe`)
The `pipe` utility in `src/utils/compose.js` allows us to compose multiple functions into a single pipeline.

For example, route validations use `pipe`:
```javascript
const validateRoute = pipe(
  validateStartPoint,
  validateEndPoint,
  validateObstacles
);
```
If we need to add a new validation (e.g., `validateWaypointsLimit`), we simply append it to the `pipe` argument list. We **extend** the validation behavior without **modifying** the existing validator functions.

## 3. Error Factory
The error generation utility in `src/utils/errors.js` exposes `createAppError(type, message)`. If we need a new type of error, we just define a new constant in `ERROR_TYPES` and pass it to the factory. We extend the system's error capabilities without ever changing the `createAppError` logic.
