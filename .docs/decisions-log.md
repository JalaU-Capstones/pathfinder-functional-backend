# Decisions Log

A chronological log of major architectural, tooling, and design decisions made throughout the project.

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
