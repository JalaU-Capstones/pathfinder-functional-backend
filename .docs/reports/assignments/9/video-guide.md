# Capstone Video Guide

Video file: capstone-alejandro-botina.mp4
Maximum duration: 5 minutes
Covers: Tarea 9.4 + Evaluacion Final (one video for both)

---

## Suggested Time Breakdown

| Segment | Duration | Content |
|---|---|---|
| 1. Opening | 0:00-0:20 | Introduce yourself and the project |
| 2. Unit test coverage | 0:20-0:50 | Show npm run test:coverage output |
| 3. JMeter demo | 0:50-1:50 | Run All in JMeter, show results |
| 4. 3 JMeter endpoints explained | 1:50-2:30 | Inputs, outputs, code |
| 5. UI demo | 2:30-3:30 | Full user workflow in browser |
| 6. 3 FP concepts with code | 3:30-4:30 | Show actual source code |
| 7. E2E tests | 4:30-4:50 | Run npm run test:e2e briefly |
| 8. Closing | 4:50-5:00 | Repository links |

---

## Segment 1 — Opening (0:00 - 0:20)

State your name, project name (Pathfinder Functional
Backend + Frontend), and what you will show in the video.

---

## Segment 2 — Unit Test Coverage (0:20 - 0:50)

Show in the terminal:
- Run: npm run test:coverage
- Wait for output to finish
- Point to the summary table showing statements,
  branches, functions, lines
- Confirm coverage is above 70% (currently 99%+)
- Note total number of test suites and tests

Key numbers to mention:
- Total test suites: [check actual output]
- Total tests: [check actual output]
- Statements coverage: [check actual output]

---

## Segment 3 — JMeter Demo (0:50 - 1:50)

Steps to show:
1. Open Apache JMeter with Pathfinder_API_Test.jmx
2. Show the test plan tree on the left panel
3. Point out the main test groups (Auth, Maps, Routes,
   Validation, Stats)
4. Show the User Defined Variables (BASE_URL, TOKEN)
5. Click Run All (green play button)
6. Show the results in the Summary Report or View
   Results Tree
7. Confirm all requests returned expected status codes
8. Mention: "This demonstrates every endpoint works
   correctly with a single click"

---

## Segment 4 — Three Endpoints Explained (1:50 - 2:30)

Select three endpoints from the JMeter plan and explain
each briefly. Suggested selection:

### Endpoint 1: POST /api/auth/signin
- Input: show the request body { name, email, password, age }
- Output: show the response { token, expiresIn, user }
- Code: open src/business/services/authService.js
  Show the register function:
  - bcrypt.hash(password, 12) — password hashing
  - signToken(user) — JWT generation
  - toAuthResponse — explicitly excludes password

### Endpoint 2: POST /api/routes (A* calculation)
- Input: show request body { mapId, start, end }
- Output: show response with optimal_path array and distance
- Code: open src/business/pathfinder.js
  Show the A* algorithm structure:
  - openSet priority queue
  - Manhattan distance heuristic
  - Waypoint-aware sequential segment calculation

### Endpoint 3: GET /stats/requests
- Input: Bearer token header only
- Output: show response { total_requests, breakdown }
- Code: open src/business/services/statsService.js
  Show getRequestStats function:
  - groupBy using reduce
  - countByMethod using reduce
  - The functional pipeline

---

## Segment 5 — UI Demo (2:30 - 3:30)

Show a complete practical workflow in the browser:

1. Navigate to http://localhost:5173
   - App redirects to /auth (not logged in)

2. Register a new account
   - Fill name, email, password, age
   - Click Create Account
   - Show redirect to home with backend status green

3. Create a map
   - Navigate to Maps
   - Click New Map
   - Set name "Demo Map", width 30, height 30
   - Optionally expand obstacles section, add one
   - Click Create Map
   - Show the grid rendering with the map

4. Add obstacles and waypoints
   - Navigate to Obstacles
   - Add an obstacle using grid click mode (show the
     interactive placement)
   - Navigate to Waypoints, add a waypoint

5. Calculate a route
   - Navigate to Routes
   - Select the Demo Map from dropdown
   - Grid renders with obstacles and waypoints visible
   - Click start cell (green), then end cell (purple)
   - Click Calculate Route
   - Show the path animating in cyan on the grid
   - Point to distance and path length stats

6. View profile
   - Navigate to Profile
   - Show own user data
   - Note: no other users visible

7. View stats
   - Navigate to Stats
   - Show the request counts, response times
   - Click Refresh
   - Note: the map creation and route calculation just
     made appear in the stats

8. Sign out
   - Click Sign out in sidebar
   - Show redirect to /auth

---

## Segment 6 — Three FP Concepts with Code (3:30 - 4:30)

Show actual source code in the editor for each concept.

### FP Concept 1: Higher-Order Functions (HOF)
File: src/presentation/middlewares/trackingMiddleware.js

Show withTracking function:
- Takes a function (controllerFn) as argument
- Returns a new function with tracking added
- Original controller is called inside the wrapper
- Explain: "A function that takes a function and returns
  a function — that is the definition of a HOF"

Also show trackingMiddleware:
- Overrides res.json with a wrapping function
- Same HOF pattern applied to a method instead of a
  standalone function

### FP Concept 2: Function Composition with Pipe
File: src/utils/routeValidators.js
File: src/utils/compose.js

Show the pipe/compose utility and how it is used to
compose the route validation pipeline.
Explain: "Pure functions chained so the output of one
is the input of the next — no intermediate variables,
no mutation"

Also show the accumulateOptimalRoute function:
File: src/utils/accumulators.js
The three-step pipe: accumulateAllRoutes (reduce) →
filter reachable → reduce to minimum distance.

### FP Concept 3: Recursion
File: src/utils/recursion.js

Show validateUuidFormat:
- Splits the UUID into segments
- Recursively validates each segment
- Base case and recursive case clearly visible

Also show detectCyclicDependencies:
- DFS implemented recursively
- Visited set prevents infinite loops
- Returns true when a back edge is found

---

## Segment 7 — E2E Tests (4:30 - 4:50)

In a terminal where the server is already running:
```
npm run test:e2e
```
Show the tests running (they take a few seconds each).
Point out:
- 5 test suites
- Tests run sequentially (--runInBand)
- Each suite creates and cleans its own test data
- All tests pass

---

## Segment 8 — Closing (4:50 - 5:00)

Mention:
- Backend repository URL
- Frontend repository URL
- Branch: deliverable/assigment9-4 (or main)

---

## Pre-recording Checklist

Before recording the video, verify all of these work:

Backend:
- [ ] docker compose up -d (PostgreSQL running)
- [ ] npm run db:migrate (schema current)
- [ ] npm run dev (server on port 3000)
- [ ] npm run test:coverage (99%+ shown in terminal)
- [ ] npm run test:e2e (all 5 suites pass)
- [ ] JMeter opens .jmx file without errors
- [ ] JMeter Run All completes with all green results

Frontend:
- [ ] npm run dev (app on port 5173)
- [ ] /auth loads correctly
- [ ] Registration works
- [ ] Map creation with grid renders
- [ ] Route calculation animates path
- [ ] Stats show data after API calls
- [ ] Logout redirects to /auth

Recording:
- [ ] Screen resolution clear and readable
- [ ] Terminal font size legible
- [ ] Editor font size legible for code sections
- [ ] Browser zoom at 100%
- [ ] All browser tabs closed except localhost:5173
- [ ] Video is under 5 minutes

---

## Files to submit

Tarea 9.4:
- GitHub backend URL
- GitHub frontend URL
- This video (capstone-alejandro-botina.mp4)

Evaluacion Final (GitLab, same video):
- Repository link (private, practitioners/professor added)
- Link to latest commit
- capstone-alejandro-botina.mp4 in repository

Video covers:
- All tarea 9.4 requirements (UI, backend, coverage,
  Postman equivalent via JMeter)
- All evaluacion final requirements (JMeter Run All,
  3 endpoints explained, 3 FP concepts, UI workflow,
  coverage shown)
