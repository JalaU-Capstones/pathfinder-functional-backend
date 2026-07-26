# Strategy Pattern

The Strategy Pattern allows a behavior or algorithm to be selected at runtime or easily swapped out without altering the core structure of the program. While we aren't using traditional object-oriented classes or interfaces to implement this, we achieve the same goal through functional abstraction.

## Where is it used?
In **Phase 5A (Route CRUD)**, we separated the pathfinding algorithm from the `routeService.js` into an isolated pure function located in `src/business/pathfinder.js`.

## Why was it chosen here?
The `calculatePath` function is a Strategy stub. The objective was to decouple the path calculation logic from the service layer so that:
1. The service layer remains focused on data validation, repository orchestration, and shape translation.
2. The core pathfinding algorithm can be replaced in Phase 5B with a more advanced algorithm (e.g., A*, Dijkstra, BFS) without touching the service, controller, repository, or routes.

By defining a strict pure function signature (`(grid, start, end, obstacles, waypoints)` returning `{ distance, path }`), we can easily "swap" the internal implementation of `calculatePath` with no external side effects.

## Phase 5B Update (2026-07-26)
In Phase 5B, the Strategy pattern promise was successfully fulfilled. The placeholder implementation was swapped with a full A* (A-Star) pathfinding algorithm inside `src/business/pathfinder.js`. This was achieved with **zero changes** to `routeService.js`, `routeController.js`, or any other file outside of the test suite and documentation. The function signature remained identical, proving the effectiveness of the strategy decoupling.
