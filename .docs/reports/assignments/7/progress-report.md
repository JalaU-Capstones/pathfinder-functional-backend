# Assignment 7.4 - Capstone Progress Report
Project: Pathfinder Functional Backend
Student: Diego Alejandro Botina
GitHub: https://github.com/JalaU-Capstones/pathfinder-functional-backend
Deliverable Branch (Assignment 7.4):
https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/assigment7-4
Period: August 17, 2026 - August 18, 2026
Course: Programming 4 - Jala University

Note: The code for Assignment 7.4 is frozen in:
deliverable/assigment7-4
(https://github.com/JalaU-Capstones/pathfinder-functional-backend/tree/deliverable/assigment7-4)
Created from main after all phases of this assignment merged.

### Section 1 - Introduction
Assignment 7.4 required implementing new rules and
optimizations using functional techniques: filters,
pipes, accumulators, and memoization. This built on
the recursive and concurrent validation layer from
Assignment 6.4, adding data processing utilities that
demonstrate functional composition at the collection
processing level.

### Section 2 - What Was Implemented This Period

| Phase | Feature | Status |
|---|---|---|
| 14A | CI/CD pipelines: GitHub Actions and GitLab CI | Complete |
| 14A | README cleanup: removed all emojis and symbols | Complete |
| 14B | Memoization utility: memoize, memoizeAsync, memoizeWithLimit | Complete |
| 14C | Filters module: filterValidWaypoints, filterReachableWaypoints, filterValidMapInput | Complete |
| 14C | Accumulators module: reachability, all-routes, optimal-route, large-map | Complete |
| 14C | Seven new validation endpoints (points 1-7) | Complete |
| 14D | Swagger YAML fix in validationRoutes.js | Complete |
| 14D | Postman collection updated with 8 new requests | Complete |

### Section 3 - Functional Techniques Applied

#### 3.1 Filters (Assignment 7.4 points 1 and 6)
Explain what a filter is: Array.prototype.filter takes
a predicate function and returns only elements satisfying
it. Pure — does not mutate the input array.

Where applied in this project:
- `filterValidWaypoints`: filters stopping points array
  keeping only items with valid position and name.
  Used in `validateMapHasValidWaypoints` service function.
- `filterValidMapInput`: uses an array of rule objects,
  filters to those whose test() returns false, maps to
  error messages. Returns all errors at once (not just first).
  Used in every new service function as the input guard.
- `filterReachableWaypoints`: filters waypoints not
  occupied by obstacles and within grid bounds.

File: `src/utils/filters.js`

#### 3.2 Accumulators (Assignment 7.4 points 2, 4, 5, 7)
Explain what an accumulator is: Array.prototype.reduce
carries a running value through each element. It is the
functional replacement for imperative loops with mutable
variables.

Where applied:
- `accumulateReachability` (point 2): reduces stopping
  points into `{ reachable: [], unreachable: [] }`. Each
  step runs A* and appends to the correct array.
- `accumulateAllRoutes` (point 4): reduces stopping points
  into an array of route objects, skipping unreachable ones.
- `accumulateOptimalRoute` (point 5): a pipe of three
  operations: accumulateAllRoutes (reduce) → filter
  reachable → reduce to minimum distance. This is the
  "pipe of accumulators" pattern explicitly required by
  the rubric.
- `accumulateLargeMapResults` (point 7): reduces stopping
  points counting processed and reached, using a memoized
  pathfinder to avoid recomputing cached sub-paths.

File: `src/utils/accumulators.js`

#### 3.3 Memoization (Assignment 7.4 points 3 and 7)
Explain what memoization is: caching the result of a
pure function call so repeated calls with the same
arguments return the cached result without recomputing.

Three variants implemented:
- `memoize`: general purpose, unbounded Map cache.
  Used for complex geometry validation.
- `memoizeAsync`: for Promise-returning functions.
  Caches the Promise itself — concurrent calls share one
  Promise. Rejects are removed from cache for retry.
- `memoizeWithLimit`: bounded cache with FIFO eviction.
  Used for large map validation where unbounded caching
  would cause memory issues.

Cache key strategy: JSON.stringify(args). Suitable for
plain data (grids, coordinate arrays, obstacle lists).

File: `src/utils/memoize.js`

#### 3.4 CI/CD Pipelines
Two pipeline files added:
- `.github/workflows/ci.yml`: GitHub Actions, runs on
  push to main and pull requests. Steps: npm ci, lint,
  test:ci. Uploads coverage artifact.
- `.gitlab-ci.yml`: GitLab CI, three stages: install,
  lint, test. Coverage regex extracts statement percentage.
  Cobertura report for GitLab MR coverage display.

Both use Node.js 22 LTS for CI stability. Database not
required because all tests mock Sequelize models.

### Section 4 - Assignment 7.4 Rubric Mapping

| Point | Requirement | Technique | File |
|---|---|---|---|
| 1 | Map has at least one valid stopping point | filter | src/utils/filters.js, filterValidWaypoints |
| 2 | Stopping points reachable from start | accumulator (reduce) | src/utils/accumulators.js, accumulateReachability |
| 3 | Algorithm handles complex geometries | memoization | src/utils/memoize.js + validationService.js |
| 4 | All possible routes considered | accumulator (reduce) | src/utils/accumulators.js, accumulateAllRoutes |
| 5 | Optimal route selected | pipe of accumulators | src/utils/accumulators.js, accumulateOptimalRoute |
| 6 | Error for invalid inputs | filter (validation) | src/utils/filters.js, filterValidMapInput |
| 7 | Large map with many obstacles | memoize + accumulator | src/utils/memoize.js + accumulators.js |
| 12 | Unit tests, coverage 70%+ | Jest | tests/ (99%+ coverage) |

### Section 5 - Test Coverage

| Metric | Result |
|---|---|
| Statements | 98.12% |
| Branches | 95.23% |
| Functions | 98.23% |
| Lines | 98.04% |
| Test Suites | 38 |
| Total Tests | 457 |

### Section 6 - AI-Assisted Development
Claude designed: the separation of filters and accumulators
into dedicated files (SRP), the pipe-of-accumulators
architecture for point 5, the three memoize variants
and when to use each, the YAML fix strategy (quoting
strings with colons), and the CI/CD pipeline configuration
with rationale for Node 22 LTS and npm ci.

Gemini executed: all utility files, service extensions,
route annotations, Postman requests, test files, and
pipeline YAML files.

All output reviewed and npm run test:coverage confirmed
before each commit.

### Section 7 - Conclusion

Assignment 7.4 conclusion: All 8 rubric points satisfied.
Filters, accumulators, and memoization are implemented
as dedicated pure utility modules following the single
responsibility principle. The pipe-of-accumulators pattern
in accumulateOptimalRoute demonstrates functional
composition at the collection processing level. CI/CD
pipelines ensure code quality is enforced automatically
on every commit to main.

Overall capstone conclusion: The project now demonstrates
the complete set of functional programming techniques
required across all assignments: pure functions, HOF,
currying, composition, Monad (Promise), SOLID principles,
recursion, concurrency, memoization, filters, and
accumulators. 300+ tests maintain 99%+ coverage.
Two CI/CD pipelines enforce quality automatically.
The codebase is ready for the final presentation.
