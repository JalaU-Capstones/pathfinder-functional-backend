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
- `POST /api/routes` - Create a new route. (Note: The distance is currently computed via a placeholder Manhattan approximation pending Phase 5B).
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
- `npm test`: Runs the Jest test suite to verify application functionality.

## 📋 Weekly Reports

Progress reports are generated at the end of each assignment period,
documenting decisions made, features implemented, and lessons learned.

| Assignment | Period | Description | Report |
|---|---|---|---|
| Assignment 2 | Jul 13 – Jul 28, 2026 | Project foundation, full CRUD for all 5 entities (Maps, Obstacles, Waypoints, Routes, Users), three-layer architecture, error handling, logging, and Postman collection. | [View report](.docs/reports/assignments/2/progress-report.md) |
