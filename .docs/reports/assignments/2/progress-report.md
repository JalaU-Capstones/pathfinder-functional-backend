# Assignment 2 — Capstone Progress Report
**Project:** Pathfinder Functional Backend
**Student:** Diego Alejandro Botina
**GitHub:** https://github.com/JalaU-Capstones/pathfinder-functional-backend
**Period:** July 13, 2026 – July 28, 2026
**Course:** Programming 4 — Jala University

#### 1. Introduction
This progress report documents the completion of Assignment 2, which requires the delivery of a functional Node.js backend encompassing full CRUD operations for all entities, a structured three-layer architecture, integration with an ORM, and a comprehensive Postman collection. The selected project option is the **Path Finder** application (Option 2). This project was chosen over the UNO card game because its core requirement—calculating optimal routes—naturally aligns with the principles of functional programming as a pure algorithm, and its entities map cleanly to a relational schema without complex state mutations.

#### 2. Stack and Technical Decisions
The following foundational technologies and conventions were chosen for the project:
- **Node.js v26 + Express (JavaScript, no TypeScript):** Provides a robust, lightweight foundation for building RESTful APIs.
- **PostgreSQL via Docker:** Ensures a scalable, ACID-compliant relational database that runs consistently across all environments. ([Database Choice](../../../database/database-choice.md))
- **Sequelize ORM:** Facilitates reliable database interactions and migrations while allowing manual mapping to plain objects to maintain functional purity. ([ORM Choice](../../../database/orm-choice.md))
- **Three-layer architecture (Presentation / Business / Data):** Strictly separates concerns, ensuring business rules are isolated from HTTP specifics and database queries. ([Architecture Overview](../../../architecture/three-layer-architecture.md))
- **Functional programming paradigm:** Enforces the use of pure functions, immutability, and isolated side-effects (no OOP, no classes, no `this`). ([Functional Approach](../../../architecture/functional-programming-approach.md))
- **ESLint Config:** Configured with strict rules to prevent mutations and enforce functional style conventions. ([ESLint Rules](../../../tooling/eslint-rules.md))
- **Swagger Documentation:** Generates interactive OpenAPI 3.0 documentation from inline JSDoc route annotations for use in development. ([Swagger Setup](../../../tooling/swagger-setup.md))
- **Winston Logging:** Provides centralized, structured JSON logging for production and colorized output for development. ([Logging Strategy](../../../tooling/logging.md))

#### 3. Implemented Features
| Phase | Feature | Status |
|---|---|---|
| 0 | Project foundation (structure, Docker, Sequelize config, tooling) | ✅ Complete |
| 0.5 | Swagger / OpenAPI documentation setup | ✅ Complete |
| 1 | Data model — 5 migrations + Sequelize models | ✅ Complete |
| 2 | CRUD: Maps | ✅ Complete |
| 3 | CRUD: Obstacles | ✅ Complete |
| 4 | CRUD: Waypoints | ✅ Complete |
| 5A | CRUD: Routes (pathfinding placeholder) | ✅ Complete |
| 6 | CRUD: Users | ✅ Complete |
| 7 | Centralized error handling & structured logging | ✅ Complete |
| — | Postman collection | ✅ Complete |

#### 4. Architecture Overview
The project rigorously adheres to a three-layer architecture to enforce the separation of concerns. The **Presentation Layer** (`src/presentation/`) is strictly responsible for handling incoming HTTP requests, routing them via Express, and dispatching responses or forwarding errors; it contains zero business logic. The **Business Logic Layer** (`src/business/`) houses the core domain rules, data validation, and shape mapping, orchestrated purely through functions. The **Data Access Layer** (`src/data/`) is the only tier permitted to execute Sequelize queries, isolating database side-effects from the rest of the application.

Functional programming principles are the bedrock of this architecture. Instead of classes, the application relies exclusively on pure functions and immutability (e.g., using `const` over `let`, and `Object.freeze` for the pathfinding grid). Side effects are strictly pushed to the boundaries—specifically, the repository layer and the centralized error handling middleware.

The single responsibility principle is enforced at the file level: every function performs exactly one well-defined task. This granularity is vital for maintainability and ensures readiness for live defenses, as the codebase's behavior is predictable and modular. Furthermore, cross-cutting concerns are aggregated in `src/utils/` (such as `errors.js`, `httpResponse.js`, `shapeMapper.js`, `validation.js`, and `logger.js`), acting as the single source of truth and preventing logic duplication.

#### 5. Design Patterns Applied

#### Chain of Responsibility Pattern
> [Full doc](../../../pattern-design/CHAIN-OF-RESPONSIBILITY-PATTERN.md)
This behavioral pattern passes requests along a chain of handlers, implemented in `src/app.js` using Express middleware (`requestLogger` -> Controllers -> `notFound` -> `errorHandler`) to eliminate inline error handling in controllers.

#### Error Factory Pattern
> [Full doc](../../../pattern-design/ERROR-FACTORY-PATTERN.md)
Instead of using OOP class hierarchies for exceptions, this pattern uses a pure function (`createAppError` in `src/utils/errors.js`) to generate standardized error objects used throughout the business services.

#### Repository Pattern
> [Full doc](../../../pattern-design/REPOSITORY-PATTERN.md)
This pattern abstracts the database layer into collection-like interfaces (`src/data/repositories/`), ensuring the service layer remains pure and ignorant of Sequelize ORM specifics.

#### Strategy Pattern
> [Full doc](../../../pattern-design/STRATEGY-PATTERN.md)
This pattern isolates algorithms behind a fixed signature, implemented for the pathfinding algorithm in `src/business/pathfinder.js`, allowing the routing logic to be easily swapped in Phase 5B without modifying the `routeService`.

#### 6. Data Model
The database consists of five distinct entities tailored for the pathfinding domain. For detailed schema information, refer to the [Data Model](../../../database/data-model.md) documentation.
- Map is the central entity; Obstacle, Waypoint, and Route all have a FK to `mapId` with CASCADE delete.
- User is independent (no FK to any other entity).
- `positionX`/`positionY` flat columns in the DB are mapped to `position: { x, y }` nested objects in the API by `src/utils/shapeMapper.js`.
- Migration order: Maps → Obstacles/Waypoints → Routes → Users.

#### 7. API Endpoints Summary
| Entity | Method | Path | Description |
|---|---|---|---|
| Health | GET | /api/health | Health check |
| Maps | POST | /api/maps | Create a map |
| Maps | GET | /api/maps | List all maps |
| Maps | GET | /api/maps/:id | Get map by ID (includes obstacles and waypoints) |
| Maps | PUT | /api/maps/:id | Update a map |
| Maps | DELETE | /api/maps/:id | Delete a map |
| Obstacles | POST | /api/obstacles | Create an obstacle |
| Obstacles | GET | /api/obstacles | List obstacles (filter: ?mapId=) |
| Obstacles | GET | /api/obstacles/:id | Get obstacle by ID |
| Obstacles | PUT | /api/obstacles/:id | Update an obstacle |
| Obstacles | DELETE | /api/obstacles/:id | Delete an obstacle |
| Waypoints | POST | /api/waypoints | Create a waypoint |
| Waypoints | GET | /api/waypoints | List waypoints (filter: ?mapId=) |
| Waypoints | GET | /api/waypoints/:id | Get waypoint by ID |
| Waypoints | PUT | /api/waypoints/:id | Update a waypoint |
| Waypoints | DELETE | /api/waypoints/:id | Delete a waypoint |
| Routes | POST | /api/routes | Create a route (triggers pathfinding) |
| Routes | GET | /api/routes | List routes (filter: ?mapId=) |
| Routes | GET | /api/routes/:id | Get route by ID |
| Routes | DELETE | /api/routes/:id | Delete a route |
| Users | POST | /api/users | Create a user |
| Users | GET | /api/users | List all users |
| Users | GET | /api/users/:id | Get user by ID |
| Users | PUT | /api/users/:id | Update a user |
| Users | DELETE | /api/users/:id | Delete a user |

*Full interactive documentation is available at `http://localhost:3000/api-docs` (Swagger UI, development only) and via the Postman collection at `.docs/collections/postman/`.*

#### 8. AI-Assisted Development
Development of this project was supported by two AI tools used in complementary roles.

**Claude (Anthropic)** acted as technical advisor and prompt architect throughout the project. It helped define the full technical roadmap (phased from foundation to CRUD to error handling), validated architectural and design pattern decisions, recommended the functional programming conventions applied consistently across the codebase, and crafted detailed phase-by-phase implementation prompts that served as precise, unambiguous specifications for the coding agent.

**Gemini 2.5 Flash (Google)** acted as the coding agent that executed those prompts. Its contributions were particularly valuable in implementation-heavy tasks: Swagger JSDoc annotations, Sequelize migration files, Express middleware wiring, Winston logger configuration, and documentation scaffolding. Gemini generated the initial implementation of all repository, service, controller, and route files across the five entities.

All generated output — code, configuration, and documentation — was reviewed, tested, and validated by the student before being committed to the repository. The architectural decisions, design pattern selections, quality standards, and the overall project structure reflected in this codebase are the result of deliberate technical judgment. AI tools accelerated execution; they did not replace decision-making.

#### 9. Decisions Log
For a chronological history of architectural choices, please see the [Decisions Log](../../../decisions-log.md). Highlights include:
- **Phase 7 (Error Handling & Logging):** Selected Winston to support structured JSON logs in production without manual formatting, and standardized the API error payload structure.
- **Phase 6 (User CRUD):** Decided to perform explicit uniqueness verification for emails via the service layer rather than passively catching Sequelize `UniqueConstraintError`s, preventing database constraints from leaking to the presentation layer.
- **Phase 5A (Route CRUD):** Implemented a placeholder pure function in `src/business/pathfinder.js` for the pathfinding algorithm, using a strategy pattern stub so the logic can be replaced in Phase 5B with no side effects.
- **Phase 0 Setup:** Strictly committed to a functional programming paradigm (no OOP) and adopted a three-layer architecture (Presentation, Business, Data).
- **Phase 1 (Data Model):** Chose to flatten complex nested API position objects into distinct relational columns (`positionX` and `positionY`) to optimize the database schema, isolating the shape translation purely within the business layer.

#### 10. Conclusion

**Assignment 2:** All rubric requirements for Assignment 2 were comprehensively met: robust CRUD pipelines for all five entities (Maps, Obstacles, Waypoints, Routes, Users), a cleanly separated three-layer architecture, effective data management via Sequelize ORM with PostgreSQL, a complete Postman collection, and integrated Swagger documentation. Going beyond the minimum baseline, the project features centralized global error handling via the chain of responsibility, structured application logging, extensive unit testing covering the service and middleware tiers, and deep technical documentation inside the `.docs/` directory. The codebase is clean, consistently formatted, and fully prepared to tackle the upcoming assignment's requirements.

**Overall capstone (current state):** The project stands as a testament to strict discipline in software design. The functional programming paradigm served as a foundational constraint that dictated the shape of every file and the flow of every function. Enforcing the single responsibility principle has yielded a system where any question regarding "where does X happen" directs the developer to exactly one unambiguous location in the codebase—a critical asset for live-defense readiness. The primary outstanding task is Phase 5B (implementing the definitive pathfinding algorithm as per pending rubric specifications) along with integrating any further directives introduced prior to the final deadline on September 4, 2026.
