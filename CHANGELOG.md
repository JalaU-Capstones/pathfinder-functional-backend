# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
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
