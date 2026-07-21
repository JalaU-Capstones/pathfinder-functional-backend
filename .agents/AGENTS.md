# Pathfinder Functional Backend

## Project Context
This project is an academic capstone for Jala University's "Programming 4" module. The objective is to build a RESTful Node.js backend for a Path Finder application. The app deals with Maps, Obstacles, Waypoints, calculating optimal routes (pathfinding algorithm), and Users.

## CRITICAL: Functional Programming Paradigm
**This project strictly follows the Functional Programming (FP) paradigm.**
- Object-Oriented Programming (OOP) is NOT allowed.
- Do NOT introduce classes, inheritance, `this`, or OOP design patterns.
- Rely on pure functions, immutability, and isolate side-effects.

## Tech Stack
- **Runtime:** Node.js v26 (JavaScript, no TypeScript)
- **Framework:** Express
- **Database:** PostgreSQL (running via Docker)
- **ORM:** Sequelize
- **Architecture:** Three-layer (Presentation / Business Logic / Data Access)
- **Testing:** Jest (+ supertest)

## Timeline
- **Start Date:** July 13, 2026
- **Due Date:** Before September 4, 2026

## Architecture Responsibilities & Non-Negotiable Rules
1. **Presentation (`src/presentation/`):** Handles HTTP requests/responses, routes, and controllers. No business logic here. *Rule:* Delegate all error-to-status mapping to the shared HTTP response helper.
2. **Business Logic (`src/business/`):** Pure functional services, pathfinding algorithms, domain rules. *Rule:* Contains mapping functions (`toApiShape`/`toDbShape`). *Rule:* Cross-entity validations (e.g. checking FK existence) MUST occur here by invoking the target entity's repository. Do not rely on passive DB constraints. *Note:* `src/business/pathfinder.js` is intentionally a placeholder; Phase 5B will implement the real algorithm inside `calculatePath` without changing its signature or any other file.
3. **Data Access (`src/data/`):** Sequelize models, repository functions, database interactions. *Rule:* Repositories are the *only* place that call Sequelize directly.
4. **Utilities (`src/utils/`):** Shared pure functions (like the Error Factory and HTTP Response Helper) to eliminate duplication.
5. **Git Flow:** All feature work must happen on dedicated `feature/<entity>-crud` branches, fully tested and linted before PR.
6. **Design Patterns:** All applied design patterns (Repository, Error Factory) must be explicitly documented in `.docs/pattern-design/`.

## Documentation Requirements
Every technical decision must be documented in the `.docs/` directory.

## Git Workflow
- Always use **Conventional Commits** (e.g., `feat(setup): initialize project structure`).
- After completing a task, always stage and commit changes professionally. Do not leave uncommitted work.
