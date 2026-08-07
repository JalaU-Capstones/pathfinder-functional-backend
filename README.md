# Pathfinder Functional Backend

This project is an academic capstone for Jala University's "Programming 4" module. The objective is to build a functional Node.js backend implementing a Path Finder application. It supports maps, obstacles, waypoints, route calculations via a pathfinding algorithm, and users. The entire application strictly follows the functional programming paradigm and a three-layer architecture (Presentation, Business Logic, Data Access).

> **Status:** This is a work-in-progress capstone. Phases will be added incrementally.

## Prerequisites

- Node.js v26+
- Docker & Docker Compose (for the PostgreSQL database)

## Clone Instructions

```bash
git clone https://github.com/JalaU-Capstones/pathfinder-functional-backend.git
cd pathfinder-functional-backend
```

## Installation and Setup

### Linux / macOS

```bash
# Install dependencies
npm install

# Copy environment variables and adjust if necessary
cp .env.example .env
```

### Windows (PowerShell)

```powershell
# Install dependencies
npm install

# Copy environment variables and adjust if necessary
Copy-Item .env.example .env
```

## Running the Database

We use Docker Compose to run a local PostgreSQL instance for development.

```bash
# Start the database container in the background
docker compose up -d

# To stop the database:
# docker compose down
```

## Running the Application

To start the server with native Node.js auto-reload:

```bash
npm run dev
```

The application will run on the port specified in your `.env` (default is 3000).

## API Endpoints

The following entities have been implemented following our purely functional, three-layer architecture:

### Maps
- `POST /api/maps` - Create a new map
- `GET /api/maps` - List all maps
- `GET /api/maps/:id` - Get a map by ID
- `PUT /api/maps/:id` - Update a map by ID
- `DELETE /api/maps/:id` - Delete a map by ID

### Obstacles
- `POST /api/obstacles` - Create a new obstacle
- `GET /api/obstacles` - List all obstacles (supports optional `?mapId=` query filter)
- `GET /api/obstacles/:id` - Get an obstacle by ID
- `PUT /api/obstacles/:id` - Update an obstacle by ID
- `DELETE /api/obstacles/:id` - Delete an obstacle by ID

### Waypoints
- `POST /api/waypoints` - Create a new waypoint
- `GET /api/waypoints` - List all waypoints (supports optional `?mapId=` query filter)
- `GET /api/waypoints/:id` - Get a waypoint by ID
- `PUT /api/waypoints/:id` - Update a waypoint by ID
- `DELETE /api/waypoints/:id` - Delete a waypoint by ID

### Routes
- `POST /api/routes` - Create a new route. (Note: The A* algorithm was used.).
- `GET /api/routes` - List all routes (supports optional `?mapId=` query filter)
- `GET /api/routes/:id` - Get a route by ID
- `DELETE /api/routes/:id` - Delete a route by ID

### Users
- `POST /api/users` - Create a new user account
- `GET /api/users` - Retrieve a list of all users
- `GET /api/users/:id` - Retrieve a user by ID
- `PUT /api/users/:id` - Update user account details
- `DELETE /api/users/:id` - Delete a user account

For detailed request/response schemas, refer to the Swagger UI below.

## 🧭 Pathfinding Algorithm

The core of this application is an **A\* (A-Star)** pathfinding
algorithm implemented as a pure function in
`src/business/pathfinder.js`.

### Why A\*
A\* was chosen for its combination of optimality and efficiency:
it finds the guaranteed shortest path while using a **Manhattan
distance heuristic** to explore far fewer nodes than Dijkstra
(which explores all directions equally) or BFS (which has no
heuristic guidance). For a 2D grid with integer coordinates —
exactly the data model used here — A\* is the optimal choice.

### Features
- **Obstacle avoidance:** blocked cells are excluded from
  neighbor exploration.
- **Waypoint support:** routes pass through all configured
  waypoints by running A\* sequentially between each checkpoint
  pair and concatenating the path segments.
- **Waypoint compliance validation:** after computation, the
  path is verified to include every waypoint position; a 422
  error is returned if any waypoint is unreachable.
- **Immutable output:** the returned path array is frozen
  (`Object.freeze`) consistent with the functional paradigm.

### Response
`POST /api/routes` returns:
```json
{
  "distance": 12,
  "optimal_path": [{ "x": 2, "y": 2 }, "...", { "x": 8, "y": 8 }]
}
```

Full algorithm documentation:
[`.docs/architecture/pathfinding-algorithm.md`](.docs/architecture/pathfinding-algorithm.md)

## ⚙️ Functional Programming Techniques

Beyond general functional style (`const`, pure functions,
immutability), this project explicitly implements:

| Technique | File | Example |
|---|---|---|
| Higher-Order Functions | `src/utils/routeValidators.js` | `requireNonEmpty(fieldName)` returns a validator |
| Currying | `src/utils/curry.js` | `isPointInGrid(grid)(point)` pre-loads grid |
| Function Composition | `src/utils/compose.js` | `pipe(f,g,h)` builds validation pipeline |

Full documentation:
[`.docs/architecture/functional-techniques.md`](.docs/architecture/functional-techniques.md)

## Logging

The backend utilizes `winston` for structured logging.
- In **development**, logs are colorized and human-readable.
- In **production**, logs are emitted as strict JSON objects for aggregation tools.
By default, the application runs at `info` level in production and `debug` level in development.

## API Documentation (Development)

Start the server in development mode (`npm run dev`) and visit:
`http://localhost:3000/api-docs`

## Postman Collection

For API testing, a comprehensive Postman Collection and Environment are provided.
See the [.docs/collections/postman/README.md](.docs/collections/postman/README.md) for import instructions and details.

## Available Scripts

### Database Migrations

For a fresh setup, the correct order of operations is:
1. Start the Docker database container (`docker compose up -d`).
2. Run database migrations (`npm run db:migrate`).
3. Seed the database (`npm run db:seed`).

Here are all the database-related scripts defined in the project:

- `npm run db:migrate`: Runs all pending Sequelize migrations to update the database schema.
- `npm run db:migrate:undo`: Reverts the last executed migration.
- `npm run db:migrate:undo:all`: Reverts all executed migrations, dropping the created tables.
- `npm run db:seed`: Runs all seeders to populate the database with initial dummy data.
- `npm run db:seed:undo`: Reverts all seeders, removing the populated initial data.
- `npm run db:test-connection`: Tests the connection to the PostgreSQL database.

### Code Quality & Testing

- `npm run lint`: Runs ESLint across the codebase to check for code quality and adherence to functional programming rules.

## 🧪 Testing & Coverage

### Run tests
```bash
npm test                  # fast, no coverage
npm run test:coverage     # full coverage report
npm run test:ci           # CI mode (strict, force exit)
```

### Coverage report
After running `npm run test:coverage`, open
`coverage/index.html` in a browser for an interactive
file-by-file breakdown.

### Thresholds
Jest enforces a minimum of **70%** on statements, branches,
functions, and lines. The test run fails if any metric drops
below this threshold.

## Current baseline
| Metric | Coverage |
|---|---|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

## 📋 Weekly Reports

Progress reports are generated at the end of each assignment period,
documenting decisions made, features implemented, and lessons learned.

| Assignment | Period | Description | Report |
|---|---|---|---|
| Assignment 2 | Jul 13 – Jul 28, 2026 | Project foundation, full CRUD for all 5 entities (Maps, Obstacles, Waypoints, Routes, Users), three-layer architecture, error handling, logging, and Postman collection. | [View report](.docs/reports/assignments/2/progress-report.md) |
| Assignment 3.4 | Jul 20 – Jul 27, 2026 | A* pathfinding algorithm, functional techniques (HOF, currying, composition), route enrichment with `optimal_path`, waypoint compliance validation, schema migration. | [View report](.docs/reports/assignments/3/progress-report.md) |
| Assignment 4.4 | Jul 27 – Jul 30, 2026 | Comprehensive unit test suite (270+ tests, 100% statement coverage, 100% branch coverage). Covers all layers: pure functions, services, repositories, controllers, middlewares. Jest coverage thresholds enforced at 70% minimum. | [View report](.docs/reports/assignments/4/progress-report.md) |
| Mid-Term Evaluation | Jul 13 – Aug 4, 2026 | Full project summary covering Assignments 2.4–4.4: complete CRUD for 5 entities, A* pathfinding, functional techniques (HOF, currying, composition), 282 tests with 100% coverage. Includes demo video. | [View Report](.docs/reports/assignments/mid-term/mid-term-report.md) |
| Assignment 5.4 | Aug 4 – Aug 7, 2026 | Formal documentation of SOLID principles within a functional architecture, refactoring to demonstrate Promise as Monad (`pipeAsync`), and a comprehensive clean code audit with test coverage maintenance. | [View Report](.docs/reports/assignments/5/progress-report.md) |
