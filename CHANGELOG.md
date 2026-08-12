# Changelog
## [Unreleased] - 2026-08-11
### Changed
- Migrated all primary keys (Maps, Users, Obstacles, Waypoints, Routes) to UUIDs.
- Updated services to validate UUIDs instead of integers.
- Updated database seeders and tests to use UUIDs.


All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
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
