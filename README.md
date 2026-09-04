# Pathfinder Functional Backend

A Node.js REST API implementing a path-finding system using functional programming principles and a three-layer architecture. Built as the capstone project for the Programming 4 module at Jala University.

## Tech Stack

- Runtime: Node.js v26
- Framework: Express
- Database: PostgreSQL (Docker)
- ORM: Sequelize
- Testing: Jest + Supertest
- Documentation: Swagger/OpenAPI 3.0
- Logging: Winston

## Architecture

The application is structured into three layers: Presentation (Express routers and controllers that handle HTTP concerns), Business (pure service functions that contain all domain logic and validation), and Data (repositories that encapsulate all Sequelize calls and return plain objects). Each layer communicates only with the layer directly below it, and no layer bypasses another.

## Prerequisites

- Node.js v26 or higher
- Docker and Docker Compose
- npm v11 or higher

## Getting Started

### Clone the repository

```bash
git clone https://github.com/JalaU-Capstones/pathfinder-functional-backend.git
cd pathfinder-functional-backend
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure these values:

| Variable | Description | Required |
|---|---|---|
| `DB_HOST` | PostgreSQL host address | Yes |
| `DB_PORT` | PostgreSQL port | Yes |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | Secret key for signing tokens | Yes |
| `JWT_EXPIRES_IN` | Token expiration (e.g., `24h`) | Yes |
| `ALLOWED_ORIGIN` | Frontend URL for CORS restriction (production only) | No |

When connecting to an external or cloud database (non-localhost), SSL/TLS is enabled automatically. No additional configuration is needed beyond setting `DB_HOST` to your database provider hostname.

### Deploying Your Own Instance
To deploy this backend in production:
1. Set `ALLOWED_ORIGIN=https://your-frontend-domain.com` in your environment variables
2. Set `NODE_ENV=production`
3. The backend will automatically reject requests from any origin other than the configured value
4. In development or when `ALLOWED_ORIGIN` is empty, all origins are permitted

### Start the database

```bash
docker compose up -d
```

### Run database migrations

```bash
npm run db:migrate
```

### Seed demo data

```bash
npm run db:seed
```

Seeds a complete demo workflow: creates a user account, a 100×100 map, and generates a full maze layout with perimeter walls and internal dividing walls (over 300 obstacles). Places two waypoints (Start at top-left, End at bottom-right) and automatically calculates the optimal route using the A* pathfinding algorithm, which navigates around obstacles to find the shortest path.

Demo seeding automatically generates a maze layout and computes the route using A* — no hardcoded paths or distances.

### Start the development server

```bash
npm run dev
```

The server starts on the port configured in `.env` (default: 3000). Use `npm start` or `npm run prod` in production.

## Available Scripts

| Script | Description |
|---|---|
| `npm test` | Run the test suite |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:coverage:watch` | Run tests with coverage in watch mode |
| `npm run test:ci` | CI mode: coverage, strict, force exit |
| `npm run lint` | Run ESLint across the codebase |
| `npm run dev` | Start the development server with auto-reload |
| `npm run db:migrate` | Run all pending database migrations |
| `npm run db:migrate:undo` | Undo the last executed migration |
| `npm run db:migrate:undo:all` | Revert all migrations |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:seed:undo` | Revert all seeders |
| `npm run db:reset` | Revert all migrations, re-migrate, and re-seed |
| `npm run db:test-connection` | Verify connectivity to the PostgreSQL database |
| `npm run test:e2e` | Run end-to-end workflow tests against real server |
| `npm start` | Start the server in production mode |
| `npm run prod` | Start the server with NODE_ENV=production |

## API Documentation

Swagger UI is available at `http://localhost:3000/api-docs` when running in development mode. The Postman collection is located at `.docs/collections/postman/`.

## API Endpoints

### Maps

| Method | Path | Description |
|---|---|---|
| POST | /api/maps | Create a map |
| GET | /api/maps | List all maps |
| GET | /api/maps/:id | Get a map by ID |
| PUT | /api/maps/:id | Update a map by ID |
| DELETE | /api/maps/:id | Delete a map by ID |

### Obstacles

| Method | Path | Description |
|---|---|---|
| POST | /api/obstacles | Create an obstacle |
| GET | /api/obstacles | List all obstacles (optional `?mapId=` filter) |
| GET | /api/obstacles/:id | Get an obstacle by ID |
| PUT | /api/obstacles/:id | Update an obstacle by ID |
| DELETE | /api/obstacles/:id | Delete an obstacle by ID |

### Waypoints

| Method | Path | Description |
|---|---|---|
| POST | /api/waypoints | Create a waypoint |
| GET | /api/waypoints | List all waypoints (optional `?mapId=` filter) |
| GET | /api/waypoints/:id | Get a waypoint by ID |
| PUT | /api/waypoints/:id | Update a waypoint by ID |
| DELETE | /api/waypoints/:id | Delete a waypoint by ID |

### Routes

| Method | Path | Description |
|---|---|---|
| POST | /api/routes | Create a route and calculate the optimal path |
| GET | /api/routes | List all routes (optional `?mapId=` filter) |
| GET | /api/routes/:id | Get a route by ID |
| DELETE | /api/routes/:id | Delete a route by ID |

### Users

| Method | Path | Description |
|---|---|---|
| POST | /api/users | Create a user account |
| GET | /api/users | List all users |
| GET | /api/users/:id | Get a user by ID |
| PUT | /api/users/:id | Update a user account |
| DELETE | /api/users/:id | Delete a user account |

### Validation

| Method | Path | Description |
|---|---|---|
| GET | /api/validation/map-id/:mapId | Validate UUID format (recursive) |
| GET | /api/validation/map-exists/:mapId | Check map exists in database |
| POST | /api/validation/map-config | Validate map has obstacles and waypoints |
| POST | /api/validation/dimensions | Validate dimensions within limits |
| POST | /api/validation/cyclic-dependencies | Detect cyclic dependencies (DFS) |
| POST | /api/validation/start-end-obstructed | Verify start and end not blocked |
| POST | /api/validation/valid-path | Verify at least one valid path exists |
| POST | /api/validation/performance | Parallel performance analysis |
| POST | /api/validation/route-intersections | Verify route has no intersections |
| POST | /api/validation/route-length | Validate route length within limits |
| POST | /api/validation/same-point | Handle start equals end case |
| POST | /api/validation/comprehensive | Run all independent checks in parallel |
| POST | /api/validation/map-waypoints | Filter for valid stopping points |
| POST | /api/validation/reachability | Check waypoint reachability |
| POST | /api/validation/complex-geometry | Memoized validation for complex maps |
| POST | /api/validation/all-routes | Accumulate all possible routes |
| POST | /api/validation/optimal-route | Select optimal route via accumulator |
| POST | /api/validation/validate-input | Filter and validate map input |
| POST | /api/validation/large-map | Memoized validation for large maps |

## Testing and Coverage

### Run tests

> Unit tests run with `npm run test` — no server required.
> E2E tests run with `npm run test:e2e` — requires PostgreSQL and `npm run dev` running on port 3000 first.

```bash
npm run test              # Run unit tests without coverage
npm run test:coverage     # Run unit tests with full coverage report
npm run test:ci           # CI mode: strict enforcement, force exit
npm run test:e2e          # Run E2E tests
```

### Coverage thresholds

Jest enforces minimum coverage thresholds on all metrics. The test run fails if any metric drops below the configured threshold. Current coverage: **Statements: 94.93%, Branches: 89.17%, Functions: 94.36%, Lines: 96.13%** — across **48 test suites and 568 unit tests**.

### Coverage report

After running `npm run test:coverage`, open `coverage/index.html` in a browser for an interactive file-by-file breakdown.

## Pathfinding Algorithm

The core of this application is an A* (A-Star) algorithm implemented as a pure function in `src/business/pathfinder.js`. A* was chosen for its combination of optimality and efficiency using a Manhattan distance heuristic, which is perfectly admissible for 4-directional movement on an integer grid. Waypoint routing is achieved by running A* sequentially between each waypoint pair and concatenating the resulting path segments. Full algorithm documentation is available in `.docs/architecture/pathfinding-algorithm.md`.

## Functional Programming Techniques

Functional programming techniques applied in this project: pure functions, immutability, higher-order functions, currying, function composition (pipe/compose), Promise as Monad (pipeAsync), recursion, concurrency (Promise.all/Promise.allSettled), memoization (memoize, memoizeAsync, memoizeWithLimit), filters (Array.prototype.filter), and accumulators (Array.prototype.reduce).

## SOLID Principles

SOLID principles are documented in `.docs/solid/` with functional paradigm adaptations.

## Weekly Reports

Progress reports are generated at the end of each assignment period, documenting decisions made, features implemented, and lessons learned.

| Assignment | Period | Description | Report |
|---|---|---|---|
| Assignment 2 | Jul 13 – Jul 28, 2026 | Project foundation, full CRUD for all 5 entities (Maps, Obstacles, Waypoints, Routes, Users), three-layer architecture, error handling, logging, and Postman collection. | [View report](.docs/reports/assignments/2/progress-report.md) |
| Assignment 3.4 | Jul 20 – Jul 27, 2026 | A* pathfinding algorithm, functional techniques (HOF, currying, composition), route enrichment with `optimal_path`, waypoint compliance validation, schema migration. | [View report](.docs/reports/assignments/3/progress-report.md) |
| Assignment 4.4 | Jul 27 – Jul 30, 2026 | Comprehensive unit test suite (270+ tests, 100% statement coverage, 100% branch coverage). Covers all layers: pure functions, services, repositories, controllers, middlewares. Jest coverage thresholds enforced at 70% minimum. | [View report](.docs/reports/assignments/4/progress-report.md) |
| Mid-Term Evaluation | Jul 13 – Aug 4, 2026 | Full project summary covering Assignments 2.4–4.4: complete CRUD for 5 entities, A* pathfinding, functional techniques (HOF, currying, composition), 282 tests with 100% coverage. Includes demo video. | [View Report](.docs/reports/assignments/mid-term/mid-term-report.md) |
| Assignment 5.4 | Aug 4 – Aug 7, 2026 | Formal documentation of SOLID principles within a functional architecture, refactoring to demonstrate Promise as Monad (`pipeAsync`), and a comprehensive clean code audit with test coverage maintenance. | [View Report](.docs/reports/assignments/5/progress-report.md) |
| Assignment 6.4 | Aug 7 – Aug 11, 2026 | UUID migration, recursive validation algorithms, structured concurrency (`Promise.all`, `Promise.allSettled`), explicit sequential/parallel separation, extended Winston logging, and updated Postman collections. | [View Report](.docs/reports/assignments/6/progress-report.md) |
| Assignment 7.4 | Aug 17-18, 2026 | Filters, accumulators, memoization. Seven new validation endpoints. Swagger YAML fix. CI/CD pipelines for GitHub Actions and GitLab. | [View report](.docs/reports/assignments/7/progress-report.md) |
| Lab Week 7 | Aug 19, 2026 | LRU memoization middleware with configurable max size and TTL. Implements LRU eviction, TTL reset on access, and uses functional filters, accumulators, and pipes. | [View report](.docs/reports/lab/week7-lru-cache-lab-report.md) |
| Lab Week 8 | Aug 28, 2026 | API usage tracking middleware. Non-blocking DB persistence. Data aggregated via HOF, reduce, filter, and map techniques across 4 new Stats endpoints. | [View report](.docs/reports/lab/week8-tracking-middleware.md) |
| Lab Week 9 | Sep 03, 2026 | End-to-end tests with Jest and native fetch. Five workflows: auth, map CRUD with data isolation, A* pathfinding, validation, and stats tracking. | [View report](.docs/reports/lab/week9-e2e-tests.md) |
| Assignment 9.4 / Final | Sep 03, 2026 | Final delivery: backend, frontend, unit tests, E2E tests, Postman, JMeter, video guide. | [View report](.docs/reports/assignments/9/progress-report.md) |

## License

MIT License. Diego Alejandro Botina. 2026.
