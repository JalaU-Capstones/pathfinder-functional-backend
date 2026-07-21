# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
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
