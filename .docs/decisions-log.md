# Decisions Log

A chronological log of major architectural, tooling, and design decisions made throughout the project.

## 2026-07-13
- **Initial Setup Phase (Phase 0):** Decided to use Node v26 with Express.
- **Paradigm Choice:** Strictly committed to a functional programming paradigm (no OOP).
- **Architecture:** Adopted a three-layer architecture (Presentation, Business, Data).
- **Database:** Chosen PostgreSQL running via Docker Compose for local dev.
- **ORM:** Chosen Sequelize, with the constraint of mapping data back to plain objects for functional integrity.
- **Testing:** Standardized on Jest and Supertest.
- **Linting:** Configured ESLint to enforce immutable and pure functional code styles.
- **Documentation:** Integrated `swagger-ui-express` and `swagger-jsdoc` to generate OpenAPI 3.0 docs from route annotations. This UI is restricted to development environments only.

## 2026-07-13
- **Phase 1 (Data Model):** Created database schema migrations and Sequelize models.
- **Primary Key Strategy:** Selected Serial Integers (`id: INTEGER`) to maintain a 1:1 mapping with the OpenAPI specification created in Phase 0.
- **ORM Functional Abstraction:** Models are instantiated via `sequelize.define` rather than classes.
- **API vs Database Flattening:** Complex nested objects like `position: { x, y }` were flattened into relational columns `positionX` and `positionY`. Translation will occur purely in the business logic layer later on.
