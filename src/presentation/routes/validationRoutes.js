'use strict';

const express = require('express');
const validationController = require('../controllers/validationController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Validation
 *   description: Validation endpoints utilizing recursive algorithms
 */

/**
 * @swagger
 * /api/validation/map-id/{mapId}:
 *   get:
 *     summary: Validate map ID UUID format (Point 1)
 *     description: Validates that a map ID string conforms strictly to UUID v4 format. The validation uses a **recursive algorithm** to process the UUID segment-by-segment. This segment-based recursive approach aligns perfectly with the 5-segment structure of a standard UUID string. Satisfies Assignment 6.4 Point 1.
 *     tags: [Validation]
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *         example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *     responses:
 *       200:
 *         description: Format is valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Map ID format is valid.
 *       400:
 *         description: Invalid UUID format.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: Invalid map ID format
 */
router.get('/map-id/:mapId', validationController.validateMapId);

/**
 * @swagger
 * /api/validation/map-exists/{mapId}:
 *   get:
 *     summary: Verify map exists in the database (Point 2)
 *     description: Validates UUID format and then queries the database to verify existence. Uses a recursive validation helper for the ID string, and an async Promise for the database lookup. Satisfies Assignment 6.4 Point 2.
 *     tags: [Validation]
 *     parameters:
 *       - in: path
 *         name: mapId
 *         required: true
 *         schema:
 *           type: string
 *         example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *     responses:
 *       200:
 *         description: Map ID exists in the database.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Map ID exists in the database.
 *       400:
 *         description: Invalid UUID format.
 *       404:
 *         description: Map not found in database.
 */
router.get('/map-exists/:mapId', validationController.checkMapExists);

/**
 * @swagger
 * /api/validation/map-config:
 *   post:
 *     summary: Validate map configuration has obstacles and waypoints (Point 3)
 *     description: Validates map configuration utilizing a **recursive algorithm** to traverse the nested object structure. Depth-first recursion checks nested structure requirements naturally without deep explicit loops. Satisfies Assignment 6.4 Point 3.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mapId:
 *                 type: string
 *                 example: 3b47e69f-788d-4b19-b81b-0b4a2fd92799
 *               mapConfig:
 *                 type: object
 *                 properties:
 *                   obstacles:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         position:
 *                           type: object
 *                           properties:
 *                             x:
 *                               type: number
 *                             y:
 *                               type: number
 *                   waypoints:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         position:
 *                           type: object
 *                           properties:
 *                             x:
 *                               type: number
 *                             y:
 *                               type: number
 *             example:
 *               mapId: "3b47e69f-788d-4b19-b81b-0b4a2fd92799"
 *               mapConfig:
 *                 obstacles:
 *                   - position: { x: 10, y: 20 }
 *                 waypoints:
 *                   - position: { x: 50, y: 60 }
 *     responses:
 *       200:
 *         description: Config is valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Map configuration validated successfully.
 *       400:
 *         description: Invalid map configuration.
 */
router.post('/map-config', validationController.validateConfig);

/**
 * @swagger
 * /api/validation/dimensions:
 *   post:
 *     summary: Validate map dimensions (Point 4)
 *     description: Validates map dimensions against limits using a **recursive algorithm**. Recursion processes one rule per call and short-circuits on failure, modeling the rule chain evaluation perfectly. Satisfies Assignment 6.4 Point 4.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               width:
 *                 type: number
 *                 example: 100
 *               height:
 *                 type: number
 *                 example: 80
 *     responses:
 *       200:
 *         description: Dimensions are valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Map dimensions are within acceptable limits.
 *       400:
 *         description: Invalid dimensions.
 */
router.post('/dimensions', validationController.validateDimensions);

/**
 * @swagger
 * /api/validation/cyclic-dependencies:
 *   post:
 *     summary: Detect cyclic dependencies in map connections (Point 6)
 *     description: Validates connections configuration using a **recursive algorithm** (Depth-First Search) to identify graph cycles. Recursion is the canonical strategy for DFS logic as the call stack captures the traversal path automatically. Satisfies Assignment 6.4 Point 6.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mapConfig:
 *                 type: object
 *                 properties:
 *                   connections:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         source:
 *                           type: string
 *                         target:
 *                           type: string
 *             example:
 *               mapConfig:
 *                 connections:
 *                   - source: "A"
 *                     target: "B"
 *                   - source: "B"
 *                     target: "A"
 *     responses:
 *       200:
 *         description: No cyclic dependencies found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: No cyclic dependencies found in map configuration.
 *       400:
 *         description: Cycle detected.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 *                       example: Cyclic dependency detected in map configuration...
 */
router.post('/cyclic-dependencies', validationController.checkCyclicDependencies);

/**
 * @swagger
 * /api/validation/start-end-obstructed:
 *   post:
 *     summary: Verify start/end points are not blocked by obstacles (Point 5)
 *     description: >
 *       Verifies that a valid path exists between the given start and end
 *       coordinates using the A* pathfinding algorithm.
 *       **Concurrency pattern — PARALLEL + SEQUENTIAL hybrid:**
 *       UUID format validation and obstacles-array type check are independent
 *       of each other, so they run simultaneously with `Promise.all` (via
 *       `runParallel`). The A* calculation then runs sequentially after both
 *       checks pass, because it depends on the validated inputs.
 *       Satisfies Assignment 6.4 Point 5.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mapId, startPoint, endPoint, obstacles]
 *             properties:
 *               mapId:
 *                 type: string
 *                 example: "3b47e69f-788d-4b19-b81b-0b4a2fd92799"
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 0 }
 *                   y: { type: number, example: 0 }
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 5 }
 *                   y: { type: number, example: 5 }
 *               obstacles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                 example: []
 *     responses:
 *       200:
 *         description: Valid path exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: At least one valid path exists between start and end points.
 *       400:
 *         description: Invalid UUID format or obstacles is not an array.
 *       404:
 *         description: No valid path exists due to obstacles.
 */
router.post(
  '/start-end-obstructed',
  validationController.checkStartEndObstructed
);

/**
 * @swagger
 * /api/validation/valid-path:
 *   post:
 *     summary: Verify at least one valid path exists on a stored map (Point 7)
 *     description: >
 *       Fetches the map from the database and runs A* to verify that at least
 *       one valid path exists between the given start and end coordinates.
 *       **Concurrency pattern — SEQUENTIAL (pipeAsync style):**
 *       The map must be fetched from the database **before** A* can run,
 *       because A* needs the map dimensions and stored obstacles. B depends
 *       on A → sequential execution is required here.
 *       Satisfies Assignment 6.4 Point 7.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mapId, startPoint, endPoint]
 *             properties:
 *               mapId:
 *                 type: string
 *                 example: "3b47e69f-788d-4b19-b81b-0b4a2fd92799"
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 0 }
 *                   y: { type: number, example: 0 }
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 9 }
 *                   y: { type: number, example: 9 }
 *     responses:
 *       200:
 *         description: Valid path found on the stored map.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: A valid path exists from start to end point.
 *       404:
 *         description: Map not found or no valid path exists.
 */
router.post('/valid-path', validationController.checkValidPath);

/**
 * @swagger
 * /api/validation/performance:
 *   post:
 *     summary: Analyze route pathfinding performance with 5 parallel runs (Point 8)
 *     description: >
 *       Runs the A* pathfinding algorithm 5 times in **parallel** using
 *       `Promise.all` to measure performance consistency and detect bottlenecks.
 *       **Concurrency pattern — PARALLEL (Promise.all via runParallel):**
 *       Each of the 5 runs uses identical inputs → they are completely
 *       independent of each other. Running them simultaneously completes in
 *       the time of the slowest single calculation, vs 5× that time
 *       sequentially. Fail-fast behaviour is acceptable here since all runs
 *       use the same algorithm and inputs.
 *       Returns `runs`, `totalDurationMs`, `averageDurationMs`, `consistent`.
 *       Satisfies Assignment 6.4 Point 8.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startPoint, endPoint, obstacles]
 *             properties:
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 0 }
 *                   y: { type: number, example: 0 }
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 9 }
 *                   y: { type: number, example: 9 }
 *               obstacles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                 example: []
 *     responses:
 *       200:
 *         description: Performance analysis completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: Performance analysis completed successfully. }
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         runs: { type: number, example: 5 }
 *                         totalDurationMs: { type: number, example: 12 }
 *                         averageDurationMs: { type: number, example: 2 }
 *                         consistent: { type: boolean, example: true }
 *                         pathFound: { type: boolean, example: true }
 *                         distance: { type: number, example: 18 }
 */
router.post('/performance', validationController.analyzePerformance);

/**
 * @swagger
 * /api/validation/route-intersections:
 *   post:
 *     summary: Verify a route does not intersect any obstacles (Point 9)
 *     description: >
 *       Checks that no step in the given path array falls on an obstacle cell.
 *       **Concurrency pattern — SYNCHRONOUS (pure function):**
 *       No async operations are needed — both the path and obstacle arrays
 *       are supplied in the request body. Uses a Set for O(1) lookups.
 *       Satisfies Assignment 6.4 Point 9.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [path]
 *             properties:
 *               path:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                 example: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]
 *               obstacles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                 example: [{ x: 5, y: 5 }]
 *     responses:
 *       200:
 *         description: Route has no intersections.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Route does not intersect with any obstacles.
 *       400:
 *         description: Path is invalid or intersects an obstacle.
 */
router.post(
  '/route-intersections',
  validationController.checkRouteIntersections
);

/**
 * @swagger
 * /api/validation/route-length:
 *   post:
 *     summary: Validate route length is within the 50 000 step limit (Point 10)
 *     description: >
 *       Validates that the number of steps in a route does not exceed
 *       MAX_ROUTE_LENGTH (50 000). This constant prevents unbounded memory
 *       usage when persisting very long paths.
 *       **Concurrency pattern — SYNCHRONOUS (pure function):**
 *       The path is provided directly — no I/O required.
 *       Satisfies Assignment 6.4 Point 10.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [path]
 *             properties:
 *               path:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                 example: [{ x: 0, y: 0 }, { x: 1, y: 0 }]
 *     responses:
 *       200:
 *         description: Route length is within limits.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Route length is within acceptable limits.
 *                     length: { type: number, example: 18 }
 *       400:
 *         description: Path is empty or exceeds the maximum length.
 */
router.post('/route-length', validationController.checkRouteLength);

/**
 * @swagger
 * /api/validation/same-point:
 *   post:
 *     summary: Handle the start === end special case (Point 11)
 *     description: >
 *       Checks whether the start and end coordinates are identical. If they
 *       are, returns immediately with `samePoint: true` — no route
 *       calculation is required. If they are different, returns
 *       `samePoint: false` to indicate that a route must be computed.
 *       **Concurrency pattern — SYNCHRONOUS (pure function):**
 *       No I/O — both points are provided in the request body.
 *       Satisfies Assignment 6.4 Point 11.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startPoint, endPoint]
 *             properties:
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 5 }
 *                   y: { type: number, example: 5 }
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 5 }
 *                   y: { type: number, example: 5 }
 *     responses:
 *       200:
 *         description: Same-point detection result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Start and end points are identical. No route calculation required.
 *                     samePoint: { type: boolean, example: true }
 */
router.post('/same-point', validationController.checkSamePoint);

/**
 * @swagger
 * /api/validation/comprehensive:
 *   post:
 *     summary: Run all independent validations in parallel (Showcase)
 *     description: >
 *       Showcase endpoint: runs UUID format check, same-point detection,
 *       route intersection check, and route length check all **simultaneously**
 *       using `Promise.allSettled` (via `runParallelSettled`).
 *       **Concurrency pattern — PARALLEL with full error collection:**
 *       All four checks are completely independent — none depends on the
 *       result of another — so they run in parallel. `Promise.allSettled`
 *       is used (instead of `Promise.all`) so that ALL failures are collected
 *       before throwing, giving the client a complete error report in a
 *       single round trip rather than one error at a time.
 *       Satisfies Assignment 6.4 comprehensive showcase.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mapId, startPoint, endPoint, obstacles]
 *             properties:
 *               mapId:
 *                 type: string
 *                 example: "3b47e69f-788d-4b19-b81b-0b4a2fd92799"
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 0 }
 *                   y: { type: number, example: 0 }
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   x: { type: number, example: 5 }
 *                   y: { type: number, example: 5 }
 *               obstacles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *                 example: []
 *               path:
 *                 type: array
 *                 description: Optional. If provided, intersection and length checks are run.
 *                 items:
 *                   type: object
 *                   properties:
 *                     x: { type: number }
 *                     y: { type: number }
 *     responses:
 *       200:
 *         description: All parallel validations passed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: All parallel validations passed.
 *                     results:
 *                       type: array
 *                       description: Results from each parallel check.
 *       400:
 *         description: One or more parallel validations failed. All errors returned at once.
 */
router.post('/comprehensive', validationController.checkComprehensive);

// ─── Phase 14C Routes ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/validation/map-waypoints:
 *   post:
 *     summary: Validate map contains valid stopping points (Point 1)
 *     description: Point 1: filter for valid stopping points using functional filter.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: Map contains valid stopping points.
 *       400:
 *         description: Validation error.
 */
router.post('/map-waypoints', validationController.validateMapWaypoints);

/**
 * @swagger
 * /api/validation/reachability:
 *   post:
 *     summary: Verify reachability of waypoints (Point 2)
 *     description: Point 2: accumulator for waypoint connectivity using functional reduce.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: Reachability results.
 *       400:
 *         description: Validation error.
 */
router.post('/reachability', validationController.checkReachability);

/**
 * @swagger
 * /api/validation/complex-geometry:
 *   post:
 *     summary: Validates map with complex geometry (Point 3)
 *     description: Point 3: memoized pathfinding for complex maps using memoization.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: Geometry validated.
 *       400:
 *         description: Validation error.
 */
router.post('/complex-geometry', validationController.validateComplexGeometry);

/**
 * @swagger
 * /api/validation/all-routes:
 *   post:
 *     summary: Accumulate all possible routes (Point 4)
 *     description: Point 4: accumulate all possible routes using functional reduce.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: All routes considered.
 *       400:
 *         description: Validation error.
 */
router.post('/all-routes', validationController.validateAllRoutes);

/**
 * @swagger
 * /api/validation/optimal-route:
 *   post:
 *     summary: Select the optimal route (Point 5)
 *     description: Point 5: pipe of accumulators for optimal route.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: Optimal route result.
 *       400:
 *         description: Validation error.
 */
router.post('/optimal-route', validationController.validateOptimalRoute);

/**
 * @swagger
 * /api/validation/validate-input:
 *   post:
 *     summary: Filter invalid map inputs (Point 6)
 *     description: Point 6: filter invalid inputs using functional filter.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: Map input is valid.
 *       400:
 *         description: Validation error.
 */
router.post('/validate-input', validationController.validateInputHandler);

/**
 * @swagger
 * /api/validation/large-map:
 *   post:
 *     summary: Validate large map results (Point 7)
 *     description: Point 7: memoization + accumulator for large maps.
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               map:
 *                 type: object
 *     responses:
 *       200:
 *         description: Large map results.
 *       400:
 *         description: Validation error.
 */
router.post('/large-map', validationController.validateLargeMap);

module.exports = router;
