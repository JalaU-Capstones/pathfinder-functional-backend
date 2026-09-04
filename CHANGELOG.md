# Changelog

## [Unreleased] - 2026-09-04
### Security
- **CRITICAL FIX:** Enforce JWT expiration validation in authMiddleware
  - Expired tokens are now properly rejected with 401 "Session expired"
  - Added tests: valid token passes, expired/missing-exp tokens rejected
  - Previously: tokens accepted indefinitely — **HIGH SEVERITY FIX**

- **2026-09-03 (Phase Lab9B - E2E Documentation and JMeter):**
  - docs(jmeter): commit JMeter test plan and add README
  - docs(lab): add week 9 E2E test lab report with all
    five workflow descriptions and test case tables
  - docs(reports): add assignment 9.4 progress report
    covering all weeks 2-9 implementations
  - docs(reports): add video guide with 5-minute segment
    plan covering tarea 9.4 and evaluacion final
  - docs: update readme with lab week 9 and final report rows

- **2026-09-02 (Phase Lab9A - E2E Tests):**
  - test(e2e): add five end-to-end test workflows using\
    Jest and native fetch against the real server
  - test(e2e): workflow 1 - authentication register, login,\
    profile access, update and user enumeration prevention
  - test(e2e): workflow 2 - map CRUD and data isolation\
    between two concurrent users
  - test(e2e): workflow 3 - full A* pathfinding pipeline\
    including obstacle avoidance verification
  - test(e2e): workflow 4 - validation endpoints covering\
    UUID, map existence, dimensions, same-point and\
    cyclic dependency detection
  - test(e2e): workflow 5 - API tracking middleware and all\
    four stats aggregation endpoints
  - chore: add test:e2e npm script with runInBand and\
    30 second timeout

- **2026-09-02 (Stats userId Isolation Fix):**
  - fix(tracking): inject `userId` from `req.user.userId` into `ApiStat` records — previously stored `null` for all authenticated requests because `buildStatPayload` read `req.user?.id` instead of `req.user?.userId`.
  - fix(repo): add four userId-filtered aggregate functions to `apiStatRepository` (`getRequestStats`, `getResponseTimeStats`, `getStatusCodeStats`, `getPopularEndpoints`) using Sequelize `fn()` for DB-level aggregation.
  - fix(service): add four `*Service` wrappers in `statsService` that accept `userId` and delegate to the new repository functions; original in-memory aggregation functions preserved for backward compatibility.
  - fix(controller): extract `userId` from `req.user?.userId` in all four stats controller actions and pass it to the new service wrappers — users now see only their own statistics.
  - fix(routes): apply `authMiddleware` at route level in `statsRoutes.js` (defense-in-depth) in addition to the global app-level guard.
  - fix(app): mount stats routes at `/api/stats` instead of `/stats` — resolves 404 on all `/api/stats/*` endpoints.
  - test(tracking): update `buildStatPayload` test to use `user.userId` instead of `user.id`.
  - test(controller): update `statsController.test.js` to use `/api/stats/*` paths and `*Service` mock names.

- **2026-08-31 (Phase Auth-4 - Bug Fixes & Postman):**
  - fix(repositories): pass `userId` through `createMapWithRelations` to `Map.create` to fix 403 Forbidden bug on map creation.
  - test(services): update mock assertions in map, obstacle, waypoint, and route service tests to include `userId`.
  - docs(postman): add Auth folder with Register and Login endpoints.
  - docs(postman): auto-save JWT tokens via test scripts and inject into protected endpoints.
  - docs(postman): update Postman README and environment variables.

- **2026-08-31 (Phase Auth-3 - Ownership Filtering):**
  - feat(middleware): add JWT `authMiddleware` and apply it globally to all `/api` routes.
  - feat(auth): add generic `assertOwnership` utility for verifying user permissions.
  - feat(repositories): update all repository operations to filter by `userId`.
  - feat(services): enforce data ownership by injecting `userId`.
  - feat(controllers): protect all endpoints so users only see their own data.
  - refactor(user): completely isolate User endpoints under `/api/users/me`.
  - docs(swagger): update Swagger documentation with `bearerAuth`.
  - test(auth): mock `authMiddleware` and update 100+ tests across the app to maintain 100% test pass rate.

## [Unreleased] - 2026-08-29
feat(auth): add POST /api/auth/signin (register + auto login)
feat(auth): add POST /api/auth/login (credentials + JWT)
feat(auth): add authService with bcrypt and JWT signing
refactor(users): remove POST /api/users - user creation moved to auth/signin
fix(repositories): update getUserByEmail to support includePassword option for login flow
fix(errors): add 401 UNAUTHORIZED to error handler status code mapping
test(auth): add authService and authController tests

## [Unreleased] - 2026-08-29
### Added
- **2026-08-29 (Phase Auth-1 - Auth Database Foundation):**
  - chore(deps): add bcryptjs and jsonwebtoken for JWT auth
  - feat(database): add password column to Users table
  - feat(database): add userId FK to Maps, Obstacles, Waypoints, Routes tables with SET NULL cascade
  - feat(models): update all entity models with new fields
  - feat(models): add User ownership associations to all entity models
  - feat(models): add defaultScope to User model excluding password from all default queries
  - feat(seeders): update demo seeder with hashed password and userId references

## [Unreleased]

### Added
- `statsService` with functional aggregations (`groupBy`, `reduce`, `map`, `filter`).
- Four new GET endpoints on `/stats`: `/requests`, `/response-times`, `/status-codes`, `/popular-endpoints`.
- Postman collection Stats folder.
- Lab Week 8 report.

## [Unreleased] - 2026-08-19
### Added
- **2026-08-28 (Lab Week 8 - Phase Lab8B):**
  - feat(middleware): add trackingMiddleware using HOF to
    capture and persist API usage stats per request
  - feat(middleware): add withTracking HOF controller wrapper
    for explicit HOF demonstration (lab week 8)
  - feat(app): register trackingMiddleware on /api routes
  - test(middleware): add comprehensive trackingMiddleware
    unit tests including HOF behavior verification
  - docs: document tracking middleware design decisions
- **2026-08-28 (Lab Week 8 - Phase Lab8A):**
  - feat(database): add ApiStats table via new migration
    for API usage tracking (lab week 8)
  - feat(models): add ApiStat Sequelize model
  - feat(repositories): add apiStatRepository with
    createStat, getAllStats, getStatsByEndpoint,
    getStatCount and clearStats
  - test(repositories): add apiStatRepository unit tests
  - docs(database): document ApiStats schema and design
    decisions
- **2026-08-19 (Phase Lab7C - LRU Cache Lab Report):**
  - docs(lab): add week 7 LRU cache memoization lab report covering problem statement, LRU vs FIFO design decision, Map data structure rationale, factory pattern, TTL reset on access, functional techniques (filters, pipes, accumulators), implementation summary, real test coverage numbers, manual verification output, and conclusion
  - docs: update readme weekly reports table with Lab Week 7 row
- **2026-08-19 (Phase Lab7B - LRU Memoization Middleware):**
  - feat(middleware): add LRU memoization middleware with configurable max size and TTL for GET response caching
  - feat(routes): add GET /api/cache/stats monitoring endpoint
  - feat(controllers): add cache stats controller with dependency injection
  - test(middleware): add cacheMiddleware and cacheController unit tests
  - docs: document cache middleware design decisions
- **2026-08-19 (Phase Lab7A - LRU Cache Utility):**
  - feat(utils): add createLRUCache factory with LRU eviction and TTL support for lab week 7 memoization middleware
  - test(utils): add comprehensive lruCache unit tests including TTL reset on access and LRU eviction ordering
  - docs: document LRU cache design decisions

## [Unreleased]

### Added
- `statsService` with functional aggregations (`groupBy`, `reduce`, `map`, `filter`).
- Four new GET endpoints on `/stats`: `/requests`, `/response-times`, `/status-codes`, `/popular-endpoints`.
- Postman collection Stats folder.
- Lab Week 8 report. - 2026-08-17
### Added
- **2026-08-18 (Phase 14D - Fixes & Postman):**
  - fix(swagger): quote description strings containing colons in validationRoutes.js JSDoc annotations
  - test: run full test suite and fix any coverage gaps
  - docs(postman): add 8 new requests for assignment 7.4
  - docs: update readme with new endpoints and techniques
  - docs(reports): add assignment 7.4 progress report
- **2026-08-18 (Phase 14C - Filters, Accumulators & Endpoints):**
  - feat(utils): add filters module with filterValidWaypoints, filterReachableWaypoints and filterValidMapInput
  - feat(utils): add accumulators module with reachability, all-routes, optimal-route and large-map accumulators
  - feat(validation): extend validation service with 7 new functions covering assignment 7.4 points 1-7
  - feat(validation): add 7 new endpoints under /api/validation
  - test(utils): add filters and accumulators unit tests
  - test(validation): extend validation service and controller tests
- **2026-08-17 (Phase 14B - Memoization Utility):**
  - feat(utils): add memoize, memoizeAsync and memoizeWithLimit utilities
  - test(utils): add comprehensive memoize unit tests including rejection retry and concurrent call deduplication
  - docs: document memoization decisions in decisions log
- **2026-08-17 (Phase 14A - CI/CD Pipelines & README Cleanup):**
  - ci: add github actions workflow for lint, test and coverage.
  - ci: add gitlab ci pipeline for lint, test and coverage.
  - docs: rewrite readme removing emojis and updating project state.
  - docs: document ci/cd decisions in decisions log.

## [Unreleased]

### Added
- `statsService` with functional aggregations (`groupBy`, `reduce`, `map`, `filter`).
- Four new GET endpoints on `/stats`: `/requests`, `/response-times`, `/status-codes`, `/popular-endpoints`.
- Postman collection Stats folder.
- Lab Week 8 report. - 2026-08-11
### Changed
- Migrated all primary keys (Maps, Users, Obstacles, Waypoints, Routes) to UUIDs.
- Updated services to validate UUIDs instead of integers.
- Updated database seeders and tests to use UUIDs.


All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `statsService` with functional aggregations (`groupBy`, `reduce`, `map`, `filter`).
- Four new GET endpoints on `/stats`: `/requests`, `/response-times`, `/status-codes`, `/popular-endpoints`.
- Postman collection Stats folder.
- Lab Week 8 report.
### Added
- **2026-08-11 (Phase 13C - Concurrency & Parallel Validations):**
  - feat(utils): add concurrency helpers (`runParallel`, `runParallelSettled`, `validateAll`).
  - feat(validation): add parallel validation functions to `validationService`.
  - feat(routes): add 7 new validation endpoints for Phase 13C.
  - test(concurrency): add full unit tests for concurrency utilities and new validation methods.
  - docs(architecture): add concurrency architecture documentation.
- **2026-08-11 (Phase 13B - Recursive Validation Functions):**
  - feat(utils): add recursive validation functions (UUID, map config, dimensions, cycle detection).
  - feat(validation): add validation service and controller.
  - feat(routes): add /api/validation/* endpoints.
  - test(utils): add recursion unit tests.
  - docs(patterns): add recursive validation pattern doc.
- **2026-08-07 (Phase 12C - Clean Code Audit & Assignment 5.4 Report):**
  - refactor(services): improve validation error messages in `mapService.js` to be more explicit.
  - docs(utils): add file-level JSDoc comments to all shared utilities.
  - docs(reports): add Assignment 5.4 and Week 5 Lab Monad reports.
- **2026-08-07 (Phase 12B - Promise as Monad):**
  - feat(monad): introduce `src/utils/monad.js` with `of`, `chain`, `map`, `tryCatch`, and `pipeAsync`.
  - refactor(services): refactor `routeService.js` to explicitly use `pipeAsync` monadic composition.
  - docs(monad): add `.docs/architecture/monad-promise.md` documenting Monad laws and implementation details.
  - test(monad): add full coverage for monad utilities and explicitly test Monad laws.
- **2026-08-04 (Phase 12A - SOLID Principles):**
  - docs(solid): add SOLID principles documentation with functional paradigm adaptations (SRP, OCP, LSP, ISP, DIP).
  - refactor(services): extract helper functions in `mapService.js` to improve SRP compliance.
- **2026-07-30 (Phase 11E - Final Coverage Gaps & Assignment 4.4):**
  - test(final): close last coverage gaps in pathfinder, env config, and validation.
  - docs(reports): add assignment 4.4 progress report.
  - docs(readme): update coverage baseline and weekly reports.
- **2026-07-30 (Phase 11D - Surgical Branch Coverage Gaps):**
  - test(services): complete branch coverage testing for all services, reaching 100% statement and branch coverage.
  - test(utils): cover defensive logic and falsy branches in `shapeMapper.js`, `httpResponse.js`, and `errorHandler.js`.
  - test(app): mock environment variables in `logger.js` and `app.js` via `jest.isolateModules` and `jest.resetModules` for 100% coverage.
  - test(pathfinder): mock `Map.prototype.has` to cover impossible/defensive pathfinding branches.
- **2026-07-30 (Phase 11C - Controller & Route Integration Tests):**
  - test(controllers): add supertest integration tests for all 5 entity controllers and health endpoint.
  - chore(coverage): exclude swagger.js from coverage collection.
- **2026-07-30 (Phase 11B - Complete Repository Layer Tests):**
  - test(repositories): add complete unit tests for routeRepository, userRepository, and mapRepository covering all CRUD operations and edge cases.
- **2026-07-30 (Phase 11A - Jest Coverage Configuration):**
  - feat(testing): configure Jest coverage with 70% thresholds, HTML report, and CI script.
  - chore(gitignore): exclude coverage/ directory.
  - docs(tooling): add coverage documentation.
- **2026-07-28 (Composite Map Creation):**
  - fix(maps): support atomic creation of obstacles and waypoints via `POST /api/maps` using Sequelize transactions and bulkCreate.
  - fix(maps): silently ignore unknown fields (type, description) in obstacle and waypoint items.

- **2026-07-27 (Phase 10 - Documentation & Delivery):**
  - Phase 10: Postman collection updated with `optimal_path` in Route responses and 422 example.
  - Assignment 3.4 progress report added.
  - README updated with A* algorithm section, functional techniques section, and Assignment 3.4 weekly report link.
- **2026-07-27 (Phase 9 - Route Enrichment & CRUD Integration):**
  - Phase 9: added `path` JSONB column to Routes via new migration.
  - Route create/read responses now include `optimal_path` array.
  - Waypoint compliance validation added post-pathfinding (422 on failure).
  - Updated Swagger Route schema with `optimal_path` field.
- **Phase 8 Functional Programming Refactor:**
  - Introduced `pipe`, `compose`, and `curry` utilities.
  - Refactored `routeService.js` validation into a composed pipeline.
  - Added `requireNonEmpty` HOF for generating configurable map validators.
  - Added full test coverage for the new functional utilities.
- **Phase 5B A* Pathfinding Algorithm:**
  - Implemented a pure functional A* algorithm in `src/business/pathfinder.js`.
  - Added waypoint-aware pathfinding via sequential segment concatenation.
  - Expanded pathfinder unit test suite with 7 new scenarios covering obstacles, waypoints, and edge cases.
- **Postman Collection & Environment:**
  - Added a complete Postman Collection (v2.1) covering all endpoints (Health, Maps, Obstacles, Waypoints, Routes, Users) to `.docs/collections/postman/`.
  - Added a parameterized Postman Environment configuring local variables like `baseUrl`, `mapId`, and `userId`.
- **Phase 7 Error Handling & Logging:**
  - Implemented a structured `winston` logging system with environment-aware formatting (JSON for production, colorized for development).
  - Added HTTP request logging middleware to track method, URL, status, and duration for every request.
  - Added a global `errorHandler` middleware to centralize and standardize all API error responses.
  - Added `notFound` middleware to cleanly handle undefined routes.
  - Added global `uncaughtException` and `unhandledRejection` process event handlers.
### Changed
- **Phase 7 Controller Refactoring:**
  - Removed all inline `try/catch -> res.status()` logic from controllers across all 5 entities. Controllers now forward errors to the global handler via `next(error)`, implementing a clean Chain of Responsibility pattern.
- **Phase 6 Complete User CRUD:**
  - Implemented Create, Read, Update, and Delete for the independent User entity.
  - Handled email uniqueness via explicit repository lookups before insertion/update.
  - Extended shared `httpResponse.js` and `errors.js` utility to support `409 Conflict` mapping for duplicate emails.
  - Centralized email format validation into a new `src/utils/validation.js` pure utility.
  - Swagger JSDoc route annotations for all User endpoints.
- **Phase 5A Complete Route CRUD:**
  - Implemented Create, Read, and Delete for the Route entity (no Update).
  - Designed a pathfinding placeholder (`src/business/pathfinder.js`) acting as a pure function to calculate distance using a temporary Manhattan approximation.
  - Wired `routeRepository.js`, `routeService.js`, and `routeController.js` to handle DB operations, input validation, and business logic respectively.
  - Swagger JSDoc route annotations for all Route endpoints.
- **Phase 4 Complete Waypoint CRUD:**
  - Implemented full Create, Read, Update, Delete for the Waypoint entity (`src/data/repositories/waypointRepository.js`, `src/business/services/waypointService.js`).
  - Added optional `?mapId` filter for listing waypoints.
  - Used `shapeMapper.js` for shape translation.
  - Updated Map responses (`getMapById`, `getAllMaps`) to eagerly load and include waypoints in the API shape.
  - Full Jest test coverage for Service and Repository layers.
  - Swagger JSDoc route annotations for all Waypoint endpoints.
- **Phase 3 Complete Obstacle CRUD:**
  - Implemented full Create, Read, Update, Delete for the Obstacle entity.
  - Implemented Repository pattern for database access (`src/data/repositories/obstacleRepository.js`).
  - Added optional `?mapId` filter for listing obstacles.
  - Implemented Service layer for validating Map existence and mapping shapes (`src/business/services/obstacleService.js`).
  - Full Jest test coverage for Service and Repository layers (Happy path and validation).
  - Swagger JSDoc route annotations for all Obstacle endpoints.
- **Phase 2 Complete Map CRUD:**
  - Implemented full Create, Read, Update, Delete for the Map entity.
  - Implemented Repository pattern for database access (`src/data/repositories/mapRepository.js`).
  - Implemented functional Service layer for business logic and data mapping (`src/business/services/mapService.js`).
  - Added shared utilities for error handling and HTTP response mapping.
  - Full Jest test coverage for Service and Repository layers (Happy path).
  - Swagger JSDoc route annotations for all Map endpoints.
- Phase 1 Complete Data Model setup.
- Database migrations and Sequelize models for User, Map, Obstacle, Waypoint, Route.
- Centralized model association loading in `src/data/models/index.js`.
- Demo seeder script for initial data population.
- Added `sequelize-cli` tooling and `.sequelizerc` configuration.
- Added NPM scripts for migrations and seeding (`db:migrate`, `db:seed`, etc.).
- Swagger (OpenAPI 3.0) integration for API documentation during development.
- Base reusable schemas for Map, Obstacle, Waypoint, Route, and User.

## [0.1.0] - 2026-07-13
### Added
- Phase 0 foundation setup.
- Three-layer architecture skeleton (`src/presentation`, `src/business`, `src/data`).
- Docker Compose configuration for PostgreSQL.
- Base dependencies (Express, Sequelize, pg, dotenv, Jest, ESLint).
- ESLint rules configured for functional programming (`prefer-const`, `no-var`).
- Basic database connection test script.
- Project documentation (README, AGENTS.md, `.docs/`).
