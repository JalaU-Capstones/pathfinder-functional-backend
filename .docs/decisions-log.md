# Decisions Log

A chronological log of major architectural, tooling, and design decisions made throughout the project.

## 2026-07-27 (Phase 9 - Route Enrichment)
- **Path Storage (JSONB):** Decision to use JSONB over TEXT for `path` storage in the database. JSONB enables structured storage (binary JSON format) and future indexed queries; Sequelize also handles array serialization/deserialization automatically.
- **Path Nullability:** Decision to set `allowNull: true` on the new `path` column. This prevents breaking backward compatibility with existing rows in the DB which lack path data, without needing a complex data migration.
- **Waypoint Validation Timing:** Decision to validate waypoint compliance AFTER pathfinding (not before) — because the path must exist to check it.
- **Error Code for Waypoint Failure:** Decision to use 422 (Unprocessable Entity) over 400 for waypoint compliance failure — the request is well-formed but semantically unprocessable given the map configuration.

## 2026-07-27
- **Phase 8 (Functional Programming Techniques):** Introduced currying, higher-order functions, and function composition utilities.
- **Composition utility:** Decided to use `pipe` over `compose` as the primary composition utility for validations. The left-to-right execution of `pipe` better matches the mental model of a top-to-bottom pipeline.
- **Validation Pattern:** Adopted Railway-oriented validation where pure functions return the context on success or throw a typed error on failure. This was chosen over returning explicit `Result`/`Either` monad types to keep the Node/Express codebase simple without needing a heavyweight functional library like Ramda or fp-ts.
- **HOFs:** Introduced `requireNonEmpty` as a higher-order function that dynamically generates validation rules. Documented existing uses of `.map()` and `.filter()` across services.
- **Currying:** Created curried domain validators (`isPointInGrid`, `isSamePoint`) for reusability and partial application inside the validation pipeline.

## 2026-07-26
- **Phase 5B (Pathfinding Algorithm):** Implemented the A* (A-Star) algorithm in `src/business/pathfinder.js`.
- **Algorithm Choice:** Chose A* over Dijkstra and BFS due to its optimality and efficiency using heuristics on a grid. Refer to `.docs/architecture/pathfinding-algorithm.md` for the full rationale.
- **Heuristic:** Selected Manhattan distance because movement is strictly 4-directional, making it perfectly admissible and computationally cheap.
- **Waypoint Handling:** Implemented waypoint routing by splitting the path into sequential A* segments and concatenating the results. This preserves functional composition.
- **Tradeoffs:** Used a simple array for the open set instead of a priority queue. Given the maximum grid sizes (≤ 100x100), the functional simplicity of array methods outweighs the minimal performance gain of a heap.

## 2026-07-21
- **Phase 7 (Error Handling & Logging):** Integrated structured logging and centralized error handling.
- **Winston Logger:** Selected `winston` to support structured JSON logs in production without manual formatting.
- **Standardized Error Shape:** Decided on a strict `{"success": false, "error": {"code": "...", "message": "..."}}` shape for all API errors. Stack traces are conditionally appended only if `NODE_ENV === 'development'` to prevent security leakage.
- **Controller Refactor to next(error):** Removed redundant inline error formatting from all controllers. All errors are now handled by a global Express middleware (Chain of Responsibility), significantly reducing code duplication and standardizing HTTP mapping.

## 2026-07-21
- **Phase 6 (User CRUD):** Implemented User entity CRUD operations.
- **Explicit Uniqueness Check:** For the `email` field, decided to perform explicit uniqueness verification via the service layer (querying the repository before creating/updating) rather than passively catching Sequelize `UniqueConstraintError`. This allows domain logic to live in the service rather than leaking DB driver details to the presentation layer.
- **409 Conflict Extension:** Extended the shared `httpResponse.js` and `errors.js` helper to return a proper `409 Conflict` HTTP status code when an explicit uniqueness check fails.

## 2026-07-21
- **Phase 5A (Route CRUD):** Implemented Route entity CRUD without the final pathfinding algorithm.
- **Strategy Pattern (Stub):** Implemented a placeholder pure function in `src/business/pathfinder.js` for the pathfinding algorithm. This ensures that when the real algorithm is decided in Phase 5B, it can be replaced without changing the function signature, repository, service, or controller. Distance is currently approximated using Manhattan distance.

## 2026-07-13
- **Initial Setup Phase (Phase 0):** Decided to use Node v26 with Express.
- **Paradigm Choice:** Strictly committed to a functional programming paradigm (no OOP).
- **Architecture:** Adopted a three-layer architecture (Presentation, Business, Data).
- **Database:** Chosen PostgreSQL running via Docker Compose for local dev.
- **ORM:** Chosen Sequelize, with the constraint of mapping data back to plain objects for functional integrity.
- **Testing:** Standardized on Jest and Supertest.
- **Linting:** Configured ESLint to enforce immutable and pure functional code styles.
- **Documentation:** Integrated `swagger-ui-express` and `swagger-jsdoc` to generate OpenAPI 3.0 docs from route annotations. This UI is restricted to development environments only.

## 2026-07-21
- **Phase 4 (Waypoint CRUD):** Implemented Waypoint entity architecture following the pattern established by Obstacles and Maps.
- **Code Reuse:** Extracted database shape conversion into `src/utils/shapeMapper.js` (`toApiPosition` and `toDbPosition`) to maintain DRY principles across Obstacles, Waypoints, and Map responses.

## 2026-07-21
- **Phase 3 (Obstacle CRUD):** Replicated the Map reference architecture.
- **Cross-Entity Validation:** Decided to validate foreign keys (Map existence) explicitly inside the Service layer using `mapRepository.getMapById` instead of relying passively on SQL constraint errors. This provides clearer error messaging and better domain encapsulation.
- **Query Filters:** Added an optional `?mapId` query parameter to the Obstacle list endpoint to facilitate retrieving obstacles for a specific map naturally.

## 2026-07-20
- **Phase 2 (Map CRUD):** Established reference architecture for CRUD pipelines.
- **Repository Pattern:** Isolated all Sequelize calls into `src/data/repositories` to keep the Service layer pure.
- **Error Factory:** Created `src/utils/errors.js` and `createAppError` factory instead of using OOP `class` constructs.
- **HTTP Response Helper:** Centralized error-to-status mapping into `src/utils/httpResponse.js` to eliminate duplication across controllers.

## 2026-07-13
- **Phase 1 (Data Model):** Created database schema migrations and Sequelize models.
- **Primary Key Strategy:** Selected Serial Integers (`id: INTEGER`) to maintain a 1:1 mapping with the OpenAPI specification created in Phase 0.
- **ORM Functional Abstraction:** Models are instantiated via `sequelize.define` rather than classes.
- **API vs Database Flattening:** Complex nested objects like `position: { x, y }` were flattened into relational columns `positionX` and `positionY`. Translation will occur purely in the business logic layer later on.
