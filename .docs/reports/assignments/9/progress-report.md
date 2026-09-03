# Assignment 9.4 - Capstone Final Delivery Report

Project: Pathfinder Functional Backend + Frontend
Student: Diego Alejandro Botina
GitHub (Backend):
  https://github.com/JalaU-Capstones/pathfinder-functional-backend
GitHub (Frontend):
  https://github.com/JalaU-Capstones/pathfinder-functional-frontend
Date: September 03, 2026
Course: Programming 4 - Jala University

## Deliverables

| Item | Location | Status |
|---|---|---|
| Backend source code | github.com/JalaU-Capstones/pathfinder-functional-backend | Complete |
| Frontend source code | github.com/JalaU-Capstones/pathfinder-functional-frontend | Complete |
| Unit tests (coverage 70%+) | tests/unit/ | 99%+ coverage |
| E2E tests | tests/e2e/ | 5 workflows |
| Postman collection | .docs/collections/postman/ | Complete |
| JMeter test plan | .docs/collections/jmeter/ | Complete |
| Demo video | .docs/reports/assignments/9/capstone-alejandro-botina.mp4 | Pending upload |

## Backend Summary

The Pathfinder backend is a Node.js REST API implementing
a path-finding system using A* algorithm and functional
programming principles. Built with Express, PostgreSQL,
Sequelize, and a strict three-layer architecture.

### Weeks 2-4 (Foundation)
- CRUD for Maps, Obstacles, Waypoints, Routes, Users
- Three-layer architecture: Presentation / Business / Data
- PostgreSQL with Docker, Sequelize ORM, UUID primary keys
- Unit tests with Jest + Supertest, 99%+ coverage

### Week 5 (SOLID + Clean Code)
- SOLID principles documented in .docs/solid/
- Promise as Monad (pipeAsync, tryCatch, chain)
- Error factory pattern, centralized error handling
- Winston structured logging

### Week 6 (Recursion + Concurrency)
- A* pathfinding with Manhattan heuristic
- UUID validation using recursive segment checking
- Concurrent validation using Promise.all/allSettled
- 12 validation endpoints under /api/validation/*

### Week 7 (Filters + Accumulators + Memoization)
- Filters: filterValidWaypoints, filterValidMapInput
- Accumulators: reachability, all-routes, optimal-route
- Memoization: memoize, memoizeAsync, memoizeWithLimit
- CI/CD: GitHub Actions + GitLab CI pipelines

### Week 8 (Tracking + Auth)
- LRU cache middleware with TTL and configurable max size
- API tracking middleware using HOF (res.json override)
- Four stats endpoints using groupBy/filter/map/reduce
- JWT authentication: bcryptjs + jsonwebtoken
- Ownership filtering: each user sees only their data

### Week 9 (E2E Tests)
- Five end-to-end test workflows with Jest + real fetch
- JMeter test plan for automated endpoint demonstration

## Frontend Summary

Vue 3 + Vite web application consuming the backend API.
Dark theme with cyan accent. Responsive layout.

### Views implemented
- AuthView: login and register with JWT auto-store
- HomeView: backend status + navigation cards
- MapsView: map CRUD with interactive dual-mode grid
- RoutesView: A* route calculation with path animation
- ObstaclesView: obstacle management with grid placement
- WaypointsView: waypoint management with grid placement
- ValidationView: five backend validation checks
- StatsView: live API usage dashboard
- ProfileView: own account management only

### Technical highlights
- Dual rendering: DOM divs (<=22,500 cells) or Canvas
  (>22,500 cells) — prevents browser freeze on large maps
- Zoom system: +/-, Ctrl+scroll, per-instance state
- JWT stored in localStorage with client-side expiry check
- Router guard: unauthenticated users redirected to /auth
- AuthModal: mid-session token expiry handled gracefully

## Functional Programming Concepts Applied

### 1. Pure functions and immutability
Every utility function in src/utils/ is pure: same input
always produces the same output, no side effects.
Examples: normalizePath, getCellType, buildTokenPayload,
filterValidWaypoints.

### 2. Higher-order functions
The tracking middleware (withTracking, trackingMiddleware)
wraps functions with additional behavior without modifying
the originals. The cache middleware overrides res.json
in the same HOF pattern.

### 3. Function composition with pipe/compose
Route validation uses a pipeline of validators:
validateRouteContext = pipe(requireNonEmpty,
validateMapConfig, validateStartEnd, ...).
Each validator is a pure function composed sequentially.

### 4. Recursion
UUID validation checks each segment recursively.
Cyclic dependency detection uses recursive DFS with a
visited set. Map configuration validation recurses through
nested obstacle and waypoint arrays.

### 5. Concurrency with Promise.all
The comprehensive validation endpoint runs all independent
checks in parallel using Promise.all/allSettled. The
frontend stats view loads all four endpoints concurrently.

### 6. Memoization
Three variants implemented: memoize (unbounded), 
memoizeAsync (Promise-based, removes rejections), 
memoizeWithLimit (FIFO/LRU eviction). Applied to
pathfinding for complex geometries and large maps.

### 7. Filters and accumulators (reduce)
filterValidWaypoints, filterReachableWaypoints using
Array.prototype.filter. accumulateReachability,
accumulateOptimalRoute, accumulateLargeMapResults
using Array.prototype.reduce as the accumulator pattern.
