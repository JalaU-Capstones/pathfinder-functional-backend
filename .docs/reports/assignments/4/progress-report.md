# Assignment 4.4 — Capstone Progress Report
**Project:** Pathfinder Functional Backend
**Student:** Diego Alejandro Botina
**GitHub:** https://github.com/JalaU-Capstones/pathfinder-functional-backend
**Deliverable Branch (Assignment 4.4):**
https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/assigment4-4
**Period:** July 27, 2026 – July 30, 2026
**Course:** Programming 4 — Jala University

> **Note:** The code delivered for Assignment 4.4 is frozen in:
> [deliverable/assigment4-4](https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/assigment4-4).
> This branch was created from `main` after all phases of this
> assignment were merged, preserving a snapshot for review while
> the project continues evolving on `main`.

## Section 1 — Introduction
Assignment 4.4 required the implementation of comprehensive unit tests for all API endpoints and business logic, with the strict requirement to achieve and maintain at least 70% code coverage across the board. This phase built upon the partial test suite developed in earlier assignments, expanding it into a robust, professional-grade test suite that guarantees the reliability of the Pathfinder backend. We leveraged the inherent testability of the functional programming paradigm to reach complete coverage.

## Section 2 — What Was Implemented This Period

| Phase | Feature | Status |
|---|---|---|
| 11A | Jest coverage configuration (thresholds, HTML report, CI script) | ✅ Complete |
| 11B | Complete repository layer tests (routeRepository, userRepository, mapRepository) | ✅ Complete |
| 11C | Controller integration tests via supertest (all 5 entities + health) | ✅ Complete |
| 11D | Branch coverage gaps: services, middlewares, utils, logger, app | ✅ Complete |
| 11E | Final gaps: pathfinder.js, env.js, validation.js | ✅ Complete |
| — | Bugfix: POST /api/maps atomic creation with obstacles/waypoints | ✅ Complete |

## Section 3 — Coverage Achievement

### Final Coverage Results
| Metric | Before (Assignment 2.4) | Rubric Minimum | Final Result |
|---|---|---|---|
| Statements | 88.83% | 70% | 100% |
| Branches | 78.47% | 70% | 100% |
| Functions | 85.6% | 70% | 100% |
| Lines | 89.42% | 70% | 100% |

### Test Suite Growth
| Metric | Assignment 2.4 | Assignment 4.4 |
|---|---|---|
| Test Suites | 17 | 30 |
| Total Tests | 123 | 282 |
| Passing | 123 | 282 |
| Failing | 0 | 0 |

### Why the numbers are high
The 70% minimum was significantly surpassed (reaching 100% across all metrics) because:
- Every architectural layer was tested independently: pure unit tests for utility functions, mock-based unit tests for services and repositories, and integration tests for controllers via supertest.
- The functional programming paradigm made units inherently testable. Since pure functions lack side effects, they are the easiest possible structures to unit test deterministically.
- The Single Responsibility Principle ensured that every function had exactly one clearly defined behavior to assert.

## Section 4 — Testing Strategy by Layer

### Pure Function Tests (utils, pathfinder)
Pure functions (having no side effects and deterministic output) are tested directly without any mocks. Examples include `compose.js`, `curry.js`, `pathfinder.js`, `shapeMapper.js`, and `routeValidators.js`.

### Service Layer Tests (mock-based unit tests)
Services contain business logic and are tested by mocking their repository dependencies. The service functions are invoked directly without setting up an HTTP server or Database connection. This approach isolates the core business logic from I/O concerns, ensuring fast execution and deterministic results. Examples: `mapService.test.js`, `routeService.test.js`.

### Repository Layer Tests (mock-based unit tests)
Repositories handle database interactions and are tested by mocking the Sequelize model methods (e.g., using `jest.mock('../../src/data/models', ...)`). This avoids the need for a live database connection during testing while still validating data access logic. Examples: `mapRepository.test.js`, `routeRepository.test.js`.

### Controller / Route Tests (supertest integration)
Controllers function as HTTP adapters, meaning the appropriate test level is an actual HTTP request. `supertest` mounts the Express app without starting a live server on a port, and the underlying services are mocked. This comprehensively covers route registration, controller logic, the `httpResponse.js` helper, and the error handler middleware all in one test. Examples: `mapController.test.js`.

### Middleware Tests
Middleware functions are tested by constructing mock `req`, `res`, and `next` objects, then asserting on the expected `res.status`, `res.json`, and `next` calls. Branch logic based on environment variables (like `NODE_ENV`) is tested by temporarily overriding `process.env.NODE_ENV` and using `jest.resetModules()` to force a module re-evaluation.

## Section 5 — Rubric Requirements Mapping

| Rubric Point | Description | Coverage | Test File |
|---|---|---|---|
| 1 | Unit tests for Map CRUD | ✅ | mapService.test.js, mapRepository.test.js, mapController.test.js |
| 2 | Unit tests for Obstacle CRUD | ✅ | obstacleService.test.js, obstacleRepository.test.js, obstacleController.test.js |
| 3 | Unit tests for Waypoint CRUD | ✅ | waypointService.test.js, waypointRepository.test.js, waypointController.test.js |
| 4 | Unit tests for Route CRUD | ✅ | routeService.test.js, routeRepository.test.js, routeController.test.js |
| 5 | Unit tests for User CRUD | ✅ | userService.test.js, userRepository.test.js, userController.test.js |
| 6 | Unit tests for map/start/end validation | ✅ | routeValidators.test.js, routeService.test.js |
| 7 | Unit tests for map configuration validation | ✅ | routeValidators.test.js (requireNonEmpty HOF) |
| 8 | Unit tests for pathfinding algorithm usage | ✅ | routeService.test.js (mocked calculatePath) |
| 9 | Unit tests for A* implementation | ✅ | pathfinder.test.js |
| 10 | Unit tests for optimal path calculation | ✅ | pathfinder.test.js (distance, path correctness) |
| 11 | Unit tests for waypoint constraint compliance | ✅ | routeService.test.js, routeValidators.test.js |
| 12 | Unit tests for route CRUD integration | ✅ | routeController.test.js, routeRepository.test.js |
| 13 | Comprehensive system tests | ✅ | All 30 suites, 282 tests |

> **Note:** The ≥ 70% coverage threshold is strictly enforced by the Jest configuration in `package.json`. It is not merely a manual check; the CI script (`npm run test:ci`) will fail automatically if any coverage metric drops below 70%.

## Section 6 — Notable Test Scenarios

The following are the most technically interesting test cases, likely to be highlights during a defense:

**A\* Algorithm (pathfinder.test.js):**
- Basic path with no obstacles — verifies Manhattan distance.
- Obstacle avoidance — vertical wall forces detour.
- No path exists — completely blocked grid returns `{ distance: -1, path: [] }`.
- Waypoint traversal — path visits all intermediate points sequentially.
- Immutability — validates that the returned object and path array are deeply frozen.

**Functional Techniques (compose.test.js, curry.test.js):**
- `pipe(f, g)(x)` guarantees left-to-right application.
- `curry(f)(a)(b)` is verified to equal `f(a, b)`.
- `isPointInGrid` uses partial application to reuse the grid context efficiently.

**Validation Pipeline (routeValidators.test.js):**
- Ensures that a full pipeline passes valid contexts through unchanged.
- Validates that each specific validator throws the correct typed error independently.
- Demonstrates how the `requireNonEmpty` Higher-Order Function (HOF) dynamically generates distinct validators per field.

**Error Handler (errorHandler.test.js):**
- Confirms that a raw `Error` object (with no `statusCode` property) safely defaults to a 500 response.
- Verifies that stack traces are present in the response body during development but stripped in production.

## Section 7 — AI-Assisted Development

> Development during this assignment period continued with the same AI-assisted workflow.
>
> **Claude (Anthropic)** designed the phased testing strategy: determining which files to target first based on coverage impact, specifying the correct mocking approach per layer (pure unit vs mock-based vs supertest integration), designing the rubric coverage mapping, and crafting prompts for each phase. Claude also analyzed the coverage reports between phases and identified the remaining gaps to close.
>
> **Gemini 2.5 Flash (Google)** executed the implementation: writing the test files, configuring Jest coverage thresholds, and implementing the supertest integration tests. Gemini also fixed the `POST /api/maps` bug (atomic creation of obstacles and waypoints via Sequelize transactions).
>
> All output was reviewed, `npm run test:coverage` was run after each phase to verify results, and no phase was considered complete until coverage targets were confirmed in the terminal output.

## Section 8 — Conclusion

**Assignment 4.4:** All 13 rubric points are satisfied. The project achieved a flawless 100% statement and branch coverage across the entire codebase—far exceeding the 70% minimum. Over 280 tests across 30 suites rigorously cover every layer: pure functions, services, repositories, controllers, middlewares, and utilities. The coverage thresholds are strictly enforced automatically by Jest configuration. Ultimately, the functional programming paradigm proved its value here: pure functions are inherently testable, and adhering to the Single Responsibility Principle ensured that every function had exactly one easily isolated behavior to assert.

**Overall capstone (current state):** The project is now in excellent shape across all dimensions. It features a complete REST API for all 5 entities, an efficient A* pathfinding algorithm with multiple waypoint support, solid functional techniques (HOFs, currying, composition), a comprehensive test suite with 100% coverage, professional documentation organized in `.docs/`, and a clean, structured git history utilizing conventional commits. 
**Outstanding:** Preparation for any final assignment requirements leading up to the September 4, 2026 deadline.
