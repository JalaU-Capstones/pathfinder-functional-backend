# Week 9 Lab Activity - End-to-End Tests

Student: Diego Alejandro Botina
Project: Pathfinder Functional Backend
Repository: https://github.com/JalaU-Capstones/pathfinder-functional-backend
Date: September 03, 2026
Course: Programming 4 - Jala University
Lab: C.9 Laboratorio Semana 9 - Activity 1

## 1. Overview

This lab adds end-to-end (E2E) tests to the Pathfinder
backend API. Unlike unit tests, which mock dependencies and
test individual functions in isolation, E2E tests send real
HTTP requests over TCP to a running server against a real
PostgreSQL database. They validate complete user workflows
from the perspective of an actual API client.

### Difference between unit tests and E2E tests

| Aspect | Unit Tests | E2E Tests |
|---|---|---|
| Dependencies | Mocked (jest.mock) | Real (server + DB) |
| Scope | One function or module | Full HTTP request cycle |
| Speed | Fast (milliseconds) | Slower (seconds) |
| Confidence | Implementation details | Real user workflows |
| Isolation | Each test is independent | Suite-level isolation |

### Technology used

- Test runner: Jest
- HTTP client: Native fetch (Node.js 18+ built-in)
- Server: Pathfinder backend running on localhost:3000
- Database: PostgreSQL via Docker Compose

## 2. Test Infrastructure

### Setup utilities (tests/e2e/setup.js)

Three shared utilities used by all test suites:

#### request(path, options)
A thin fetch wrapper that handles JSON headers, request
body serialization, and response body parsing. Returns
`{ status, body }` so tests can assert on both the HTTP
status code and the response body.

#### registerTestUser(prefix)
Creates a unique test user on each run using a timestamp
and random suffix in the email address:
`{prefix}-{timestamp}-{random}@pathfinder-e2e.test`

This prevents conflicts between test runs and between
suites running in the same run. The user is deleted in
afterAll for clean data isolation.

#### checkServerHealth()
Calls GET /api/health before each suite starts. If the
server is not reachable, it throws a descriptive error
explaining how to start the server before running E2E
tests.

### Test execution

```bash
# Prerequisites
docker compose up -d        # Start PostgreSQL
npm run db:migrate          # Apply migrations
npm run dev                 # Start backend server

# In another terminal:
npm run test:e2e            # Run all E2E tests
```

The `--runInBand` Jest flag runs all suites sequentially,
not in parallel. Parallel E2E suites would cause race
conditions on the shared database. Sequential execution
guarantees predictable ordering and clean isolation.

## 3. Test Workflows

### Workflow 1 — Authentication (auth.e2e.test.js)

**Purpose:** Validate the complete JWT authentication
lifecycle from registration to profile management.

**Endpoints tested:**
- POST /api/auth/signin
- POST /api/auth/login
- GET /api/users/me
- PUT /api/users/me
- DELETE /api/users/me

**Test cases:**

| Test | Input | Expected outcome |
|---|---|---|
| Register new user | name, email, password, age | 201 with JWT token, no password in response |
| Register duplicate email | same email twice | 409 Conflict |
| Register with short password | password < 8 chars | 400 Validation Error |
| Login with valid credentials | email + password | 200 with JWT token |
| Login with wrong password | correct email + wrong pass | 401 Unauthorized |
| User enumeration prevention | wrong email vs wrong pass | Same 401 error message |
| Access profile with token | Bearer token | 200 with user data |
| Access profile without token | no header | 401 Unauthorized |
| Access profile with invalid token | malformed JWT | 401 Unauthorized |
| Update profile name | new name via PUT | 200 with updated name |

**Security scenarios validated:**
- Password hash never appears in any response
- Same error message for wrong email and wrong password
  (prevents user enumeration attacks)
- Endpoints return 401 for missing or invalid tokens

---

### Workflow 2 — Map Management and Data Isolation
(maps.e2e.test.js)

**Purpose:** Validate the complete map CRUD cycle and
confirm that each user can only access their own data.

**Endpoints tested:**
- POST /api/maps
- POST /api/obstacles
- POST /api/waypoints
- GET /api/maps (list)
- GET /api/maps/:id (detail with relations)
- PUT /api/maps/:id
- DELETE /api/maps/:id
- DELETE /api/obstacles/:id
- DELETE /api/waypoints/:id

**Test cases:**

| Test | Input | Expected outcome |
|---|---|---|
| Create map | name, dimensions | 201 with map ID and userId |
| Create map without auth | no token | 401 Unauthorized |
| Add obstacle to map | mapId, position, size | 201 with obstacle data |
| Add waypoint to map | mapId, position, name | 201 with waypoint data |
| Get map with relations | map UUID | 200 with embedded obstacles and waypoints |
| Data isolation — list | User 2 lists maps | Empty array (does not see User 1 maps) |
| Data isolation — get by id | User 2 fetches User 1 map | 404 Not Found |
| Data isolation — delete | User 2 deletes User 1 map | 403 Forbidden |
| Update map name | new name via PUT | 200 with updated name |

**Data isolation model validated:**
Two concurrent test users are registered. User 1 creates
a map. User 2's GET /api/maps returns an empty array,
GET /api/maps/:id returns 404, and DELETE returns 403.
The backend extracts userId from the JWT and applies it
as a WHERE clause in all queries.

---

### Workflow 3 — A* Pathfinding Pipeline
(pathfinding.e2e.test.js)

**Purpose:** Validate the complete pathfinding workflow
from map creation to route calculation, including obstacle
avoidance verification.

**Endpoints tested:**
- POST /api/maps
- POST /api/obstacles (5 obstacles forming a wall)
- POST /api/waypoints
- POST /api/routes
- GET /api/routes/:id
- GET /api/routes (list)

**Test cases:**

| Test | Input | Expected outcome |
|---|---|---|
| Create 15x15 map | name, dimensions | 201 |
| Add 5 obstacle wall | positions (3,0)-(3,4) | 201 for each |
| Add mid waypoint | position (7,7) | 201 |
| Calculate A* route | start (0,0), end (14,14) | 201 with optimal_path array |
| Verify path avoids obstacles | optimal_path cells | No cell at x=3, y=0-4 |
| Verify path starts near origin | first cell in path | Manhattan distance <= 2 from (0,0) |
| Reject blocked start point | start on obstacle (3,0) | 400 or 422 |
| List routes | GET /api/routes | Route ID in response |

**A* verification approach:**
After the route is calculated, the test fetches the full
route object and iterates every `{x, y}` cell in
`optimal_path`. For each cell, it checks that none of the
five obstacle positions `{x:3, y:0}` through `{x:3, y:4}`
match. If any path cell lands on an obstacle, the test
fails — this would indicate a bug in the A* implementation.

---

### Workflow 4 — Validation Endpoints
(validation.e2e.test.js)

**Purpose:** Validate the backend validation operations
that demonstrate functional programming techniques.

**Endpoints tested:**
- GET /api/validation/map-id/:mapId (recursive UUID check)
- GET /api/validation/map-exists/:mapId
- POST /api/validation/dimensions
- POST /api/validation/same-point
- POST /api/validation/cyclic-dependencies (DFS)

**Test cases:**

| Test | Input | Expected outcome |
|---|---|---|
| Valid UUID format | real map UUID | 200 success |
| Invalid UUID format | 'not-a-valid-uuid' | 400 error |
| Existing map | real map UUID | 200 success |
| Non-existent map UUID | all-zeros UUID | 404 not found |
| Valid dimensions | 100x100 | 200 success |
| Excessive dimensions | 99999x99999 | 400 error |
| Same start and end | {5,5} and {5,5} | 200 samePoint: true |
| Different points | {0,0} and {10,10} | 200 samePoint: false |
| Cyclic graph | A→B→C→A | 400 cycle detected |
| Linear graph | A→B→C | 200 no cycle |

**Functional programming techniques verified:**
- UUID validation uses recursive segment-by-segment
  checking (recursion pattern)
- Cyclic dependency detection uses depth-first search
  with memoization (DFS + memoization patterns)

---

### Workflow 5 — API Tracking and Statistics
(stats.e2e.test.js)

**Purpose:** Validate that the tracking middleware
correctly records every request and that the four stats
aggregation endpoints return accurate data.

**Endpoints tested:**
- GET /stats/requests
- GET /stats/response-times
- GET /stats/status-codes
- GET /stats/popular-endpoints

**Test cases:**

| Test | Input | Expected outcome |
|---|---|---|
| Total request count | — | total_requests > 0 |
| Breakdown includes /api/maps | — | /api/maps key in breakdown |
| Response time avg <= max | — | min <= avg <= max for each endpoint |
| Status code 200 present | — | data['200'] > 0 |
| All values are positive integers | — | All counts >= 1 |
| Ranked endpoints descending | — | ranked[i] >= ranked[i+1] |
| Stats require auth | no token | 401 Unauthorized |

**Tracking middleware verification:**
The beforeAll registers a user, creates a map, and makes
three additional GET requests. After this setup, the
stats endpoints are expected to show those requests in
their aggregations. This confirms the HOF tracking
middleware is capturing every /api/* request correctly.

## 4. Running the E2E Tests

### Start the server

```bash
# Terminal 1
docker compose up -d
npm run db:migrate
npm run dev

# Terminal 2
npm run test:e2e
```

### Expected output

```
PASS tests/e2e/auth.e2e.test.js
PASS tests/e2e/maps.e2e.test.js
PASS tests/e2e/pathfinding.e2e.test.js
PASS tests/e2e/validation.e2e.test.js
PASS tests/e2e/stats.e2e.test.js

Test Suites: 5 passed, 5 total
Tests:       [N] passed, [N] total
```

## 5. Issues and Resolutions

Document any issues encountered during implementation
and testing. Run the tests and fill in this section with
actual observations before submitting.

Suggested format:
- Issue: E2E tests failing because the database accumulates stale records
- Root cause: Missing data cleanup after test suites complete execution
- Resolution: Added afterAll hooks in each test suite to DELETE maps, users and routes, ensuring isolated environments.

## 6. Conclusion

The E2E test suite validates five complete user workflows
against the real running server and database. Unlike unit
tests which verify individual functions with mocked
dependencies, these tests confirm that the entire system
works correctly as an integrated whole: HTTP routing,
middleware chain, JWT authentication, ownership filtering,
A* pathfinding, tracking middleware, and stats aggregation.

The tests are self-contained: each suite creates its own
test data and cleans it up in afterAll, leaving the
database in the same state it was found in.
