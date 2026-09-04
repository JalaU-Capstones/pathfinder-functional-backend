# Decisions Log

A chronological log of major architectural, tooling, and design decisions made throughout the project.

## 2026-08-29 (Phase Auth-2 - Auth Endpoints)
- Decision to remove POST /api/users and move user creation to POST /api/auth/signin. Rationale: creating a user without a password is insecure. All user creation now goes through the auth flow which enforces password hashing. Old endpoint removal prevents accidental creation of passwordless accounts.
- Decision that authService calls userRepository directly (not userService). Rationale: DIP — high-level modules (authService) depend on abstractions (repositories), not on other services. Prevents cross-service coupling and circular dependency risk.
- Decision to use BCRYPT_ROUNDS = 12. Rationale: NIST and OWASP recommend at minimum cost factor 10. Factor 12 provides ~300ms hash time on modern hardware, making brute force significantly more expensive while keeping login latency acceptable.
- Decision to use the same error message for wrong email and wrong password ("Invalid email or password."). Rationale: user enumeration prevention. Different messages ("User not found" vs "Wrong password") allow attackers to enumerate valid email addresses.
- Decision to store JWT_SECRET in env.js and fail fast if missing. Rationale: a missing JWT_SECRET would cause silent failures or signing with an empty secret, which is a critical security vulnerability. Fail-fast at startup is safer.

## 2026-08-29 (Phase Auth-1 - Auth Database Foundation)
- Decision to use bcryptjs over bcrypt: bcryptjs is a pure JavaScript implementation with no native compilation step. It works identically on all platforms and CI environments without build tools. Performance difference (slightly slower) is acceptable for a backend that does not handle millions of concurrent logins.
- Decision to use allowNull: true for password and all userId FK columns: backward compatibility with existing data. Existing rows keep functioning. New rows will always have these fields populated (enforced at the service layer in Phase Auth-2/3).
- Decision to use onDelete: SET NULL for userId FKs (not CASCADE): deleting a user account should not destroy their maps, obstacles, waypoints, and routes. Those records become orphaned but are preserved. CASCADE would be destructive and irreversible.
- Decision to add a performance index on userId for each entity table: all GET endpoints will filter by userId after Phase Auth-3. Without an index, these become full table scans as the dataset grows.
- Decision to use STRING(255) for password hash: bcrypt always produces 60-character hashes, but STRING(255) provides buffer for potential algorithm changes in future without a new migration.
- Decision to add defaultScope to user.model.js excluding password: this ensures the password hash is never returned by any Sequelize query using the default scope. The auth service will use explicit attribute inclusion only when verifying login credentials.

## 2026-08-19 (Phase Lab7B - LRU Memoization Middleware)
- Decision to cache only GET requests: POST, PUT, DELETE have side effects and must always reach the business layer. Caching them would return stale data after mutations.
- Decision to cache only 2xx responses: 4xx and 5xx errors are transient and should not be cached. A 404 for a resource that gets created later must not return the cached 404.
- Decision to use factory pattern for `createCacheMiddleware` instead of a singleton: each call returns a middleware with its own isolated cache instance. This makes tests independent and allows multiple cache configurations in the same app if needed.
- Decision to inject the cache instance into `createCacheRouter` and `createCacheController` via factory parameter (DIP: depends on abstraction, not on a hardcoded import of the singleton).
- Decision to intercept `res.json` rather than `res.send` or `res.end`: all entity routes use `res.json`, making this the correct interception point. Overriding `res.send` would be broader and could accidentally cache non-JSON responses.
- Decision to add `X-Cache: HIT` / `X-Cache: MISS` headers: standard HTTP caching practice, allows clients and proxies to observe cache behavior without inspecting the response body.

## 2026-08-19 (Phase Lab7A - LRU Cache Utility)
- Decision to implement LRU over FIFO for the lab middleware cache: LRU retains recently accessed data regardless of insertion order, making it more effective for API response caching where hot endpoints receive repeated requests.
- Decision to use Map as the primary data structure: Map preserves insertion order, enabling O(1) LRU ordering via delete-and-reinsert on every access, without requiring a doubly linked list.
- Decision to reset TTL on every get (not just on set): actively accessed entries stay cached as long as they continue to be requested, which aligns with LRU semantics.
- Decision to expose a `stats()` method on the cache instance: enables the monitoring endpoint in Phase Lab7B without coupling the cache to HTTP concerns.
- Decision NOT to reuse `memoizeWithLimit` from memoize.js: it uses FIFO eviction and has no TTL support. The LRU + TTL requirements are sufficiently different to warrant a dedicated implementation.
- Decision to use `Object.freeze` on the returned cache instance: the cache API is fixed and should not be mutated by consumers. Internal state (the Map) is not frozen and evolves normally.

## 2026-08-18 (Phase 14C - Filters, Accumulators & Endpoints)
- Swagger YAML error root cause and fix: description strings containing colons must be quoted in JSDoc YAML annotations or the parser creates invalid nested mappings. Fix applied: wrap all such strings in double quotes consistently across validationRoutes.js.
- Decision to update README weekly reports table and functional techniques section to reflect current state after all 14x phases.
- Decision to separate filters and accumulators into dedicated utility files (`filters.js`, `accumulators.js`). Rationale: SRP — one file per functional concept.
- Decision to pass `pathFinder` as a parameter to accumulators rather than importing directly. Rationale: Dependency Inversion Principle (DIP). It depends on abstraction, making it easier to test using `jest.fn()`.
- Decision to create memoized pathfinder instances at the module level in `validationService.js`. Rationale: They are created once and reused across multiple HTTP requests, persisting the cache for the lifetime of the Node.js process.
- Decision to use array coordinate format (`[x, y]`) for the new 7.4 endpoints to strictly match the assignment's JSON examples, while keeping `{x, y}` objects in the internal pathfinder logic (translation happens inside the service layer).

## 2026-08-17 (Phase 14B - Memoization Utility)
- Decision to implement three memoize variants: `memoize` (general), `memoizeAsync` (Promise-based), `memoizeWithLimit` (bounded cache). Rationale: pathfinding on small maps suits `memoize`; large maps (Assignment 7.4 point 7) need `memoizeWithLimit` to prevent unbounded memory growth; async DB calls suit `memoizeAsync`.
- Decision to use JSON.stringify as the cache key strategy: correct for plain data (grids, coordinates, obstacle arrays), unsuitable for functions or circular references (documented).
- Decision to use Map over plain object for cache storage: Map preserves insertion order (needed for FIFO eviction), has O(1) has/get/set, and does not have prototype pollution risks.
- Decision to expose `.cache` property on the memoized function: enables testing and cache inspection without breaking the function's public interface.

## 2026-08-17 (Phase 14A - CI/CD Pipelines & README Cleanup)
- **Node.js 22 LTS in CI:** Decision to use Node.js 22 LTS in GitHub Actions and GitLab CI pipelines instead of the local Node.js 26. Node.js 22 LTS has broader ecosystem support in CI runner images and is the current production-stable LTS release.
- **npm ci over npm install:** Decision to use `npm ci` in all pipeline install steps. `npm ci` reads `package-lock.json` exactly and fails if the lock file is out of date, guaranteeing reproducible installs across all pipeline runs.
- **No database service in CI:** Decision to exclude a PostgreSQL service from both pipelines. All tests mock Sequelize at the model level; a live database is not needed. This validates the unit test strategy and keeps pipeline execution fast.
- **Remove emojis from README:** Decision to remove all emojis and decorative symbols from `README.md`. The codebase may be reviewed by evaluators and employers; a professional plain-text standard is required.
- **Parallel pipelines (GitHub and GitLab):** Decision to maintain identical CI pipelines on both GitHub Actions and GitLab CI. The project is hosted on GitHub but course submission uses GitLab; both platforms must run the same three-step pipeline (install, lint, test with coverage).

## 2026-08-11 (Phase 13C - Concurrency & Parallel Validations)
- **Decision:** Adopt `Promise.all` and `Promise.allSettled` for concurrent operations instead of simple sequential execution.
- **Rationale:** Many validations, especially in batch processes or when validating multi-faceted objects like a Map ID and a start point simultaneously, do not depend on each other. Using native Promises correctly optimizes these independent checks and supports the functional mandate.
- **Status:** Implemented. Utilities added in `concurrency.js` and wired into 7 new validation routes.

## 2026-08-11 (Phase 13B - Recursive Validation Functions)
- **Isolation:** Decision to isolate all recursive functions in `src/utils/recursion.js` (SRP — recursion as one concern).
- **UUID Validation:** Decision to use segment-by-segment recursion for UUID validation (natural fit for the 5-segment structure).
- **Dimension Rules:** Decision to use rule-list recursion for dimension validation (each rule is one recursive call — extensible without modifying existing rules = OCP).
- **Cycle Detection:** Decision to use DFS recursion for cycle detection (canonical algorithm — call stack = traversal path).

## 2026-08-07 (Phase 12B - Promise as Monad)
- **Monad Implementation:** Decided to explicitly document and use JavaScript's native Promise as a Monad rather than introducing a new third-party functional library (like `fp-ts` or `ramda`).
- **Pipeline Refactoring:** Refactored `routeService.js` to use `pipeAsync` (monadic function composition) to manage the async validation and computation flow, adhering strictly to mathematical Monad laws.

## 2026-08-04 (Phase 12A - SOLID Documentation)
- **Functional SOLID Adaptations:** Decision to document SOLID formally in `.docs/solid/` rather than retrofitting OOP patterns.
- **Paradigm Consistency:** Decision to interpret SOLID in functional terms (e.g., function signatures as interfaces for LSP, modules as units of responsibility for SRP).
- **Service Refactor:** Refactored `mapService.js` to extract `buildObstacleRecords` and `buildWaypointRecords` to strictly adhere to SRP.

## 2026-07-30 (Phase 11A - Coverage Configuration)
- **Threshold Enforcement:** Decision to set 70% as the Jest coverage threshold (matches rubric minimum; enforced by Jest config, not just by convention).
- **Exclusions:** Decision to exclude migrations, seeders, server.js, and sequelize.cli.js from coverage collection, with rationale.
- **Reporters:** Decision to generate both `text` and `html` reporters (text for CI output, HTML for local developer inspection).

## 2026-07-28 (Composite Map Creation)
- **Atomic Map Creation:** Decision to support atomic composite creation in `POST /api/maps` (map + obstacles + waypoints) using a single Sequelize transaction.
- **Data Integrity:** Used transaction to ensure that partial states (e.g. map created but an obstacle fails) are rolled back. Data integrity is prioritized.
- **Bulk Insert:** Used `bulkCreate` to insert multiple obstacles and waypoints to avoid N sequential database calls and improve performance.
- **Unknown Fields Ignored:** Decided to silently ignore unknown fields (like `type` or `description`) in obstacle and waypoint input payloads instead of throwing 400 validation errors to allow for forward compatibility with richer payloads in future schema versions.
- **Controller/Service Boundary:** Chose to put the composite logic entirely within `mapService.js` and `mapRepository.js`, keeping the API design natural without needing a separate endpoint.

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

## Phase 13A: Migration to UUID Primary Keys
- **Date:** 2026-08-11
- **Decision:** Migrated all entity Primary Keys (and corresponding Foreign Keys) from Integer to UUID.
- **Rationale:** To comply with Assignment 6.4 requirements and provide globally unique identifiers for distributed systems.
- **Implementation:** Created immutable migration files (20260811000001 to 20260811000005) to recreate tables with UUIDs. Updated models, seeders, services, and tests.

## 2026-08-28 (Lab Week 8 - Phase Lab8A)
- **Per-request Storage:** Decision to store one row per request rather than
  pre-aggregated summaries: the lab requires HOF
  aggregations (filter, map, reduce) in the service
  layer. Pre-aggregation would bypass those techniques.
- **responseTimeMs:** Decision to store responseTimeMs as INTEGER per row
  (not JSONB avg/min/max): raw values enable correct
  statistical aggregation; pre-computing avg/min/max
  at write time would produce incorrect results when
  new records are added.
- **No Foreign Keys:** Decision not to FK ApiStats to any entity table:
  tracking rows are analytics data, not part of the
  core domain model. Deleting a map should not cascade
  to delete its access history.
- **Indexes:** Decision to add two indexes (endpointAccess,
  timestamp): the four stats endpoints all group or
  filter by endpoint, and time-range filtering is a
  natural future requirement.

## 2026-08-28 (Phase Lab8B - Tracking Middleware)
- Decision to use res.json override (not res.on('finish'))
  for capturing the status code: res.on('finish') fires
  after the response is sent and statusCode may already
  be reset. Overriding res.json gives the status at the
  exact moment the response is constructed.
- Decision to apply trackingMiddleware to /api only (not
  /stats): tracking the stats endpoints themselves would
  create recursive data inflation — every call to
  /stats/requests would add a new row for /stats/requests.
- Decision to make persistStat non-blocking (no await in
  res.json override): the client should not wait for the
  DB write. A slow DB should not slow down API responses.
  Errors are logged via Winston, never surfaced to client.
- Decision to export both trackingMiddleware and
  withTracking: trackingMiddleware is used globally in
  app.js; withTracking is exported for explicit HOF
  demonstration as required by the lab rubric.
- Decision to export normalizePath and buildStatPayload
  as named exports: pure functions are independently
  testable and should be tested in isolation from the
  middleware integration.

## 2026-08-28 (Phase Lab8B - Teardown Fix)
- Decision to fix logger import in trackingMiddleware.js:
  logger.js exports the logger instance directly via
  module.exports = logger (not as { logger }). The original
  destructured import const { logger } = require(...) produced
  undefined, causing TypeError on logger.error inside persistStat.
  Fixed to const logger = require(...) matching requestLogger.js
  and errorHandler.js convention.
- Decision to conditionally await persistStat in NODE_ENV=test:
  The fire-and-forget persistStat(payload) call in the res.json
  override outlived Jest's module teardown, causing ReferenceError
  (require after teardown) and TypeError (undefined logger) in
  unrelated integration tests. In NODE_ENV=test, res.json now
  returns Promise.resolve(persistStat(payload)).then(() =>
  originalJson(body)) so the DB write settles before Jest destroys
  the module registry. In production and development the call
  remains fire-and-forget: the client receives the response before
  the DB write completes, preserving the non-blocking guarantee.
- Decision to update unit tests to await res.json() directly
  rather than using setTimeout delays: since NODE_ENV=test causes
  res.json to return a Promise, awaiting it is the correct and
  more deterministic pattern. The setTimeout-based waits were
  fragile (timing-dependent) and are no longer needed.

## 2026-08-28: Stats Aggregation and HOF
- **Decision:** Implemented `statsService` purely with functional programming HOFs (map, filter, reduce) instead of using raw SQL `GROUP BY` or `COUNT`.
- **Reason:** To satisfy Lab Week 8 requirements and align with the course's functional programming paradigm.
- **Decision:** Implemented a custom `groupBy` function using `reduce`.
- **Reason:** JavaScript Arrays lack a native `groupBy` method (unlike Lodash), and introducing a new third-party dependency for a single utility was deemed unnecessary.
- **Decision:** Registered `statsRoutes` at `/stats` rather than `/api/stats`.
- **Reason:** The tracking middleware is mounted on `/api`. Isolating stats endpoints prevents them from being tracked, avoiding recursive database growth where checking stats artificially inflates the stats.
- **Decision:** `statsController` delegates all logic to `statsService` and only handles HTTP mapping.
- **Reason:** Maintains strict layer separation, keeping controllers thin and easily testable with Supertest.

## 2026-08-31 (Phase Auth-3 - Ownership Filtering)
- **Decision:** Implemented a generic `assertOwnership(rowsAffected, getRecord, entityName)` utility.
- **Reason:** Centralizes the logic to differentiate between `404 Not Found` (record doesn't exist) and `403 Forbidden` (record exists but user isn't the owner) based on 0 rows affected by an update or delete query with a `{ userId }` filter.
- **Decision:** Passed `{ userId }` as an explicit option object to Repository functions (e.g., `getMapById(id, { userId })`) instead of adding a mandatory `userId` argument.
- **Reason:** Allows the same repository functions to be used for non-filtered lookups (like the `getRecord` callback in `assertOwnership`) while enabling `userId` isolation in standard data pipelines.
- **Decision:** Used `403 Forbidden` instead of `404 Not Found` for ownership check failures on updates and deletes.
- **Reason:** While `404` obscures existence and is slightly more secure, `403` provides more actionable feedback for debugging, which is acceptable for this project's security model.

## 2026-09-02 (Phase Lab9A - E2E Testing Architecture)
- **Decision to use Jest + native fetch over supertest for E2E tests:** supertest injects directly into the Express app without a real network layer. True E2E tests send real HTTP requests over TCP to a running server, testing the complete stack including network, Express, middleware chain, service, repository, and PostgreSQL.
- **Decision to run E2E tests with --runInBand (serial, not parallel):** parallel E2E test suites share a real database and would cause race conditions. Serial execution ensures predictable test order and clean data isolation.
- **Decision to use unique email suffixes (timestamp + random) for test user registration:** eliminates test data conflicts across multiple runs and prevents brittle "email already exists" failures.
- **Decision to clean up all created data in afterAll:** E2E tests must not pollute the database between runs. Each suite creates exactly what it needs and removes it on completion.

## 2026-09-04 (Phase Obs-1 - Obstacle Model Migration)
- Decision to replace JSONB position with four scalar INTEGER columns (startX, startY, endX, endY): scalar columns support SQL range queries with proper indexes, while JSONB requires full table scans for coordinate range checks. The pathfinder cell-in-rectangle check (startX <= x <= endX) is an indexed range scan on scalar columns.
- Decision that endX and endY default to startX and startY when not provided: this preserves backward compatibility — a single-cell obstacle `{x, y}` is just a rectangle where start equals end. No breaking API change is needed for callers using single-cell coordinates.
- Decision that size is now a system-calculated field: size = (endX-startX+1)*(endY-startY+1). Storing it redundantly avoids recalculating it on every read. It is validated at write time to equal the formula result — inconsistency is impossible if the service always calculates it.
- Decision to add indexes on (startX, endX) and (startY, endY) pairs: the A* obstacle expansion query filters on both pairs simultaneously. Composite indexes on the coordinate pairs are more efficient than four separate single-column indexes for this query pattern.
- Decision to remove the `positionX` and `positionY` columns entirely rather than keeping them alongside the new columns: having both would require keeping them in sync, which is error-prone. A clean migration with data transfer is the correct approach.
