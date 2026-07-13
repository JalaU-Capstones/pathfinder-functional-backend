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

## Architecture Responsibilities
1. **Presentation (`src/presentation/`):** Handles HTTP requests/responses, routes, and controllers. No business logic here.
2. **Business Logic (`src/business/`):** Pure functional services, pathfinding algorithms, domain rules.
3. **Data Access (`src/data/`):** Sequelize models, repository functions, database interactions.

## Documentation Requirements
Every technical decision must be documented in the `.docs/` directory.

## Git Workflow
- Always use **Conventional Commits** (e.g., `feat(setup): initialize project structure`).
- After completing a task, always stage and commit changes professionally. Do not leave uncommitted work.
