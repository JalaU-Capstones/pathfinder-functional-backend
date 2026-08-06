# Mid-Term Report — Pathfinder Functional Backend
**Project:** Pathfinder Functional Backend
**Student:** Diego Alejandro Botina
**GitHub:** https://github.com/JalaU-Capstones/pathfinder-functional-backend
**Deliverable Branch (Mid-Term):**
https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/mid-term
**Period Covered:** July 13, 2026 – August 4, 2026
**Course:** Programming 4 — Jala University

> **Mid-Term Submission Note:** This report summarizes all work
> completed from Assignment 2.4 through Assignment 4.4. The code,
> tests, and documentation for this submission are frozen in the
> branch:
> [deliverable/mid-term](https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/mid-term).
> The demo video for this submission is embedded below and
> available at:
> [mid-term-alejandro-botina.mp4](./mid-term-alejandro-botina.mp4)

## 🎬 Demo Video

> **Note:** GitHub does not render embedded video in Markdown.
> To watch the demo, download or open the file directly:
> [▶️ mid-term-alejandro-botina.mp4](./mid-term-alejandro-botina.mp4)

The video demonstrates:
- System startup (Docker + `npm run dev`)
- Unit test coverage results (`npm run test:coverage`)
- Three-layer architecture walkthrough
- Functional programming concepts (pipe, currying, composition)
- Full CRUD demonstration via Postman
- A* pathfinding algorithm in action (POST /api/routes with
  `optimal_path` and `distance` in response)

## 1. Executive Summary

The Pathfinder Functional Backend is a Node.js and Express application implementing a RESTful API with strict adherence to Functional Programming (FP) principles. The system handles five core entities: Maps, Obstacles, Waypoints, Routes, and Users. It is built upon a robust three-layer architecture (Presentation, Business Logic, and Data Access) and backed by a PostgreSQL database containerized via Docker and managed by the Sequelize ORM. The architecture intentionally avoids Object-Oriented patterns like classes and `this`, favoring pure functions, immutability, higher-order functions, currying, and function composition.

Over three assignment periods, the project progressed from setting up the foundation and complete CRUD functionality for all entities, to implementing a robust A* pathfinding algorithm that navigates grids while respecting obstacles and waypoints. The backend employs strategic functional techniques, routing pipelines, and clean abstractions through design patterns. Finally, the codebase was fortified with a comprehensive unit and integration testing suite using Jest and supertest, achieving a flawless execution of 282 tests across 30 suites with 100% statement, branch, function, and line coverage.

## 2. Assignment Timeline

| Assignment | Period | Focus | Detailed Report |
|---|---|---|---|
| Assignment 2.4 | Jul 13 – Jul 22, 2026 | Project foundation, full CRUD for all 5 entities, three-layer architecture, Swagger, Postman collection | [View Report](../2/progress-report.md) |
| Assignment 3.4 | Jul 20 – Jul 27, 2026 | A* pathfinding algorithm, functional techniques (HOF, currying, composition), route enrichment with `optimal_path`, waypoint compliance | [View Report](../3/progress-report.md) |
| Assignment 4.4 | Jul 27 – Jul 30, 2026 | Comprehensive unit test suite (282 tests, 100% coverage across all metrics), Jest coverage configuration, supertest integration tests | [View Report](../4/progress-report.md) |

## 3. What Was Built (Full Feature Inventory)

### 3.1 REST API Endpoints

| Entity | Method | Path | Description |
|---|---|---|---|
| Health | GET | /api/health | Health check |
| Maps | POST | /api/maps | Create map (with optional obstacles/waypoints, atomic) |
| Maps | GET | /api/maps | List all maps |
| Maps | GET | /api/maps/:id | Get map by ID (includes obstacles and waypoints) |
| Maps | PUT | /api/maps/:id | Update a map |
| Maps | DELETE | /api/maps/:id | Delete a map |
| Obstacles | POST | /api/obstacles | Create an obstacle |
| Obstacles | GET | /api/obstacles | List obstacles (?mapId= filter) |
| Obstacles | GET | /api/obstacles/:id | Get obstacle by ID |
| Obstacles | PUT | /api/obstacles/:id | Update an obstacle |
| Obstacles | DELETE | /api/obstacles/:id | Delete an obstacle |
| Waypoints | POST | /api/waypoints | Create a waypoint |
| Waypoints | GET | /api/waypoints | List waypoints (?mapId= filter) |
| Waypoints | GET | /api/waypoints/:id | Get waypoint by ID |
| Waypoints | PUT | /api/waypoints/:id | Update a waypoint |
| Waypoints | DELETE | /api/waypoints/:id | Delete a waypoint |
| Routes | POST | /api/routes | Create route (A* pathfinding, returns optimal_path) |
| Routes | GET | /api/routes | List routes (?mapId= filter) |
| Routes | GET | /api/routes/:id | Get route by ID (includes stored optimal_path) |
| Routes | DELETE | /api/routes/:id | Delete a route |
| Users | POST | /api/users | Create a user |
| Users | GET | /api/users | List all users |
| Users | GET | /api/users/:id | Get user by ID |
| Users | PUT | /api/users/:id | Update a user |
| Users | DELETE | /api/users/:id | Delete a user |

Note: Full interactive documentation at `/api-docs` (Swagger UI,
development only). Postman collection at:
[`.docs/collections/postman/`](../../collections/postman/README.md)

### 3.2 Architecture

The system strictly adheres to a three-layer architecture to isolate concerns:
- **Presentation Layer (`src/presentation/`):** Manages all HTTP interactions (Express routes, controllers). It delegates core logic to the business layer and formats the final responses.
- **Business Logic Layer (`src/business/`):** Contains the core application rules, algorithms, and services. It remains strictly independent of HTTP and the database.
- **Data Access Layer (`src/data/`):** Handles persistence and database abstractions (Sequelize models and repositories). All database manipulation happens exclusively here.

The functional paradigm directs every line of code. There are no classes or object-oriented design patterns. Business logic relies entirely on pure functions and immutability (using `const`). Side effects are carefully isolated to the repository layer, maintaining determinism. 

By applying the single responsibility principle rigorously, the architecture enables precise traceability. If a developer asks "where does X happen?", there is exactly one definitive answer.

Link: [Three-Layer Architecture](../../architecture/three-layer-architecture.md)
Link: [Functional Approach](../../architecture/functional-programming-approach.md)

### 3.3 A* Pathfinding Algorithm

The A* algorithm was chosen over Dijkstra, BFS, and DFS due to its proven optimality and grid suitability. By leveraging a Manhattan distance heuristic (admissible for a 4-directional grid without diagonals), A* efficiently minimizes node exploration. Crucially, the algorithm is implemented as a pure function without shared mutable state.

A* works by evaluating nodes based on an `fScore` (the known cost `g` plus the estimated heuristic cost `h`). It maintains an open set of candidates and iteratively explores valid, unblocked neighbors. To handle ordered waypoints, the logic employs sequential A* segments, routing from the start point to the first waypoint, and so on, concatenating the resulting paths.

Waypoint compliance is verified using the `validateWaypointsInPath` check; if any requested waypoint is missing from the computed route, a 422 Unprocessable Entity error is returned. Furthermore, to prevent expensive recalculations, computed paths are persisted as JSONB in the database (via migration `20260727000000-add-path-to-routes.js`) and returned dynamically as `optimal_path` within Route responses.

Link: [Pathfinding Algorithm](../../architecture/pathfinding-algorithm.md)

### 3.4 Functional Programming Techniques

**Higher-Order Functions:** The system heavily utilizes HOFs, such as the `requireNonEmpty(fieldName)` generator in `src/utils/routeValidators.js`, which takes a string and returns a dedicated validation function. Native Array methods like `.map()`, `.filter()`, `.every()`, and `.some()` dictate logic across the service layer.

**Currying:** Currying is applied systematically via `src/utils/curry.js`. For example, `isPointInGrid(grid)(point)` pre-loads the grid configuration for repeated reuse. Similar abstractions include `isSamePoint(a)(b)` and `isWithinBound(max)(value)`.

**Function Composition:** Execution flows are simplified via the `pipe` and `compose` utilities found in `src/utils/compose.js`. For example, the `validateRouteContext` pipeline in `src/business/services/routeService.js` replaces fragile if-chains with a declarative, pure sequence of validators.

Link: [Functional Techniques](../../architecture/functional-techniques.md)

### 3.5 Design Patterns Applied

**Repository Pattern:** Abstracts the database interactions, providing the business layer with a generic interface to query and persist data without coupling to Sequelize. Implemented across all files in `src/data/repositories/`. Chosen to isolate the persistence logic and simplify testing. Link: [Repository Pattern](../../pattern-design/REPOSITORY-PATTERN.md)

**Strategy Pattern:** Employs interchangeable functional algorithms for different operational modes (e.g. movement cost strategies) without conditional branching. Chosen to conform to the Open/Closed Principle. Link: [Strategy Pattern](../../pattern-design/STRATEGY-PATTERN.md)

**Chain of Responsibility Pattern:** Used primarily in Express middleware and error handling sequences to pass requests sequentially through a chain of handlers. Chosen to modularize pre-processing steps. Link: [Chain of Responsibility Pattern](../../pattern-design/CHAIN-OF-RESPONSIBILITY-PATTERN.md)

**Error Factory Pattern:** Encapsulates the creation of standardized, domain-specific application errors. Located in `src/utils/errors.js`. Chosen to guarantee a consistent API error structure without `new Error()` side effects. Link: [Error Factory Pattern](../../pattern-design/ERROR-FACTORY-PATTERN.md)

**Pipeline Pattern:** Structures complex business validations into an elegant flow of pure functions using `compose` or `pipe`. Implemented notably in the route validation logic. Chosen because it provides a highly readable, functional alternative to nested conditional blocks. Link: [Pipeline Pattern](../../pattern-design/PIPELINE-PATTERN.md)

### 3.6 Test Suite

| Metric | Rubric Minimum | Final Result |
|---|---|---|
| Statements | 70% | 100% |
| Branches | 70% | 100% |
| Functions | 70% | 100% |
| Lines | 70% | 100% |
| Test Suites | — | 30 |
| Total Tests | — | 282 |

Testing strategy by layer:
- **Pure functions:** Tested directly in isolation; no mocks required.
- **Services:** Tested via mock-based unit tests where downstream repositories are mocked.
- **Repositories:** Tested via mock-based unit tests where underlying Sequelize models are mocked.
- **Controllers/Routes:** Tested via supertest integration tests using a real Express instance but fully mocked services.
- **Middlewares:** Tested via mock `req`, `res`, and `next` objects.

Link: [Assignment 4.4 Report](../4/progress-report.md)
Link: [Coverage Documentation](../../tooling/coverage.md)

### 3.7 Database Schema

| Entity | Key Fields | Relations |
|---|---|---|
| Map | id, name, width, height | hasMany Obstacle, Waypoint, Route |
| Obstacle | id, mapId, positionX, positionY, size | belongsTo Map |
| Waypoint | id, mapId, positionX, positionY, name | belongsTo Map |
| Route | id, mapId, startX, startY, endX, endY, distance, path(JSONB) | belongsTo Map |
| User | id, name, age, email (unique) | independent |

Schema evolution is handled immutably. The script `20260727000000-add-path-to-routes.js` successfully introduced the `path` JSONB column to the Routes table as a new migration file, preserving strict immutable migration history.

Link: [Data Model](../../database/data-model.md)

## ✅ Mid-Term Evaluation Checklist

### Week 2 Requirements
| Requirement | Status | Location |
|---|---|---|
| CRUD for Maps | ✅ | `src/presentation/routes/mapRoutes.js`, `src/business/services/mapService.js`, `src/data/repositories/mapRepository.js` |
| CRUD for Obstacles | ✅ | `obstacleRoutes.js`, `obstacleService.js`, `obstacleRepository.js` |
| CRUD for Waypoints | ✅ | `waypointRoutes.js`, `waypointService.js`, `waypointRepository.js` |
| CRUD for Routes | ✅ | `routeRoutes.js`, `routeService.js`, `routeRepository.js` |
| CRUD for Users | ✅ | `userRoutes.js`, `userService.js`, `userRepository.js` |
| Three-layer architecture | ✅ | `src/presentation/`, `src/business/`, `src/data/` |

### Week 3 Requirements
| Requirement | Status | Location |
|---|---|---|
| Verify map configured with obstacles and waypoints | ✅ | `requireNonEmpty` HOF in `src/utils/routeValidators.js` |
| A* / Dijkstra / BFS pathfinding algorithm | ✅ | A* in `src/business/pathfinder.js` |
| Algorithm avoids obstacles and passes through waypoints | ✅ | `calculatePathWithWaypoints` in `pathfinder.js` |
| Calculate optimal path (distance + factors) | ✅ | A* distance + `optimal_path` in Route response |
| Validate path meets waypoint constraints | ✅ | `validateWaypointsInPath` in `src/utils/routeValidators.js` (422 on failure) |
| Integrate calculated route with CRUD | ✅ | `POST /api/routes` persists path+distance; `GET /api/routes/:id` retrieves stored path |

### Week 4 Requirements
| Requirement | Status | Coverage |
|---|---|---|
| Unit tests with ≥ 70% coverage | ✅ | 100% statements, 100% branches, 100% functions, 282 tests |

## 5. AI-Assisted Development

This project was developed using a structured AI-assisted workflow across all three assignment periods.

**Claude (Anthropic)** served as the technical advisor and prompt architect for the entire project. Claude designed the overall project roadmap (phased from foundation through CRUD, algorithm, functional techniques, and testing); made and documented key architectural decisions (PostgreSQL over document DB, Sequelize ORM, three-layer architecture, A* over Dijkstra/BFS, JSONB for path storage); designed the functional technique integration strategy (identifying where HOF, currying, and composition added genuine value rather than cosmetic additions); specified the phased testing strategy (which files to target in which order, which mocking approach per layer); and crafted detailed, phase-by-phase implementation prompts that served as precise specifications.

**Gemini 2.5 Flash (Google)** acted as the coding agent, executing those prompts to generate implementation code, configuration files, test suites, and documentation. Gemini's contributions spanned the full stack: Sequelize migrations and models, Express route/controller/service/repository layers, A* algorithm implementation, functional utility files (compose, curry, routeValidators), Jest test files across all layers, Swagger JSDoc annotations, and Winston logger configuration.

All AI-generated output was reviewed, tested (`npm run test:coverage` verified after each phase), and committed only after manual validation by the student. Every architectural decision, design pattern choice, and quality standard in this codebase reflects deliberate technical judgment. AI tools accelerated execution; they did not replace decision-making.

## 6. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Database | PostgreSQL | Relational FK integrity for Map→Obstacle/Waypoint/Route |
| ORM | Sequelize | JavaScript-native, mature migrations, functional-friendly |
| Algorithm | A* | Optimal for 2D grids with heuristics; pure function |
| Heuristic | Manhattan distance | Admissible for 4-directional grids |
| Path storage | JSONB column | Structured, auto-serialized, no recalculation on read |
| Migration strategy | New file per change | Immutable migration history |
| Validation style | Railway-oriented pipe | Composable, extensible, single error per step |
| Email uniqueness | Explicit pre-check | No DB constraint errors leaking to presentation layer |
| Testing: repositories | Mock Sequelize models | No DB required, fast, isolated |
| Testing: controllers | supertest + mocked services | HTTP-level without real server |

Link: [Full Decisions Log](../../decisions-log.md)

## 7. Conclusion

This project stands at the mid-term milestone as a complete, professionally structured, and thoroughly tested functional Node.js REST API. Every rubric requirement from Weeks 2, 3, and 4 has been successfully satisfied. The codebase remains meticulously clean, consistently formatted, thoroughly documented within `.docs/`, and verifiable via a single command (`npm run test:coverage`). The principles of the functional programming paradigm and single responsibility were not treated as mere constraints; instead, they organically shaped every file and functional abstraction in the system, culminating in a robust API where every architectural query yields exactly one answer.

Looking ahead, any final requirements originating from upcoming assignments before the September 4, 2026 deadline will be seamlessly integrated following the exact same architectural conventions and quality standards established across this mid-term period.
