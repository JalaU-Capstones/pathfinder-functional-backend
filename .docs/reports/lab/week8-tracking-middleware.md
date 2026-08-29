# Week 8 Lab Activity - API Tracking Middleware

Student: Diego Alejandro Botina
Project: Pathfinder Functional Backend
Repository: https://github.com/JalaU-Capstones/pathfinder-functional-backend
Date: August 28, 2026
Course: Programming 4 - Jala University
Lab: C.8 Laboratorio Semana 8 - Activity 1

## 1. Objective

Implement an API usage tracking middleware that records
request data to the database and exposes four aggregation
endpoints using functional programming techniques (HOF,
filter, map, reduce).

## 2. Data Structure

Each tracked request is stored as one row in the ApiStats
table:

| Field | Type | Description |
|---|---|---|
| id | UUID | Auto-generated primary key |
| endpointAccess | STRING | Normalized route path (UUIDs replaced with :id) |
| requestMethod | STRING | HTTP method (GET, POST, etc.) |
| statusCode | INTEGER | Response status code |
| responseTimeMs | INTEGER | Duration in milliseconds |
| userId | STRING (nullable) | Optional user identifier |
| timestamp | DATE | When the request was received |

Example stored record:
```json
{
  "endpointAccess": "/api/maps/:id",
  "requestMethod": "GET",
  "statusCode": 200,
  "responseTimeMs": 45,
  "userId": null,
  "timestamp": "2026-08-28T12:34:56Z"
}
```

## 3. Middleware Implementation (Task 1)

### HOF Pattern Used

Two HOF approaches were implemented:

**Approach A — Global Express middleware (used in production):**
Applied via `app.use('/api', trackingMiddleware)`. The
middleware function wraps `res.json` — a HOF composition
pattern: the original function is replaced by a new
function that adds behavior before delegating to the
original.

```javascript
const trackingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const originalJson = res.json.bind(res);
  res.json = (body) => {          // HOF: wraps res.json
    persistStat(buildStatPayload(
      req, res.statusCode, Date.now() - startTime
    ));
    return originalJson(body);    // delegates to original
  };
  next();
};
```

**Approach B — withTracking HOF controller wrapper:**
Takes a controller function and returns a new function
with tracking added. Demonstrates the explicit HOF pattern
required by the lab rubric.

```javascript
const withTracking = (controllerFn) =>
  async (req, res, next) => {
    const startTime = Date.now();
    try {
      await controllerFn(req, res, next);
    } finally {
      persistStat(buildStatPayload(
        req, res.statusCode, Date.now() - startTime
      ));
    }
  };
```

### Path Normalization

Before storage, `normalizePath` strips query strings and
replaces UUID segments with `:id` using a regex replace
(pure function):

```javascript
const normalizePath = (path) =>
  path.split('?')[0].replace(UUID_PATTERN, ':id');
```

This groups dynamic routes: `/api/maps/:id` accumulates
stats for ALL map reads, not one row per UUID.

### Non-blocking persistence

`persistStat` is called without `await` inside `res.json`.
DB errors are caught and logged via Winston — never
propagated to the client. API response time is not
affected by the tracking write.

Files:
- `src/presentation/middlewares/trackingMiddleware.js`
- `src/data/repositories/apiStatRepository.js`
- `src/data/migrations/20260828000001-create-api-stats.js`

## 4. Statistics Endpoints (Task 2)

### HOF techniques per endpoint

#### GET /stats/requests
Uses `groupBy` (implemented with `reduce`) to group
records by endpoint, then `countByMethod` (also `reduce`)
to count HTTP methods per group.

#### GET /stats/response-times
Uses `groupBy` (reduce) then `computeResponseTimeStats`
(reduce) which accumulates total, min, and max in a single
pass over each endpoint's records.

#### GET /stats/status-codes
Uses a single `reduce` over all records to accumulate
counts keyed by status code.

#### GET /stats/popular-endpoints
Uses `groupBy` (reduce), then `map` to transform each
group into a summary object, then `filter` to exclude
zero-count entries, then `sort` to rank by count, then
`find` (via index 0) to identify the top entry.

File: `src/business/services/statsService.js`

## 5. Test Coverage

Run `npm run test:coverage` and record the actual output:

| File | Statements | Branches | Functions |
|---|---|---|---|
| trackingMiddleware.js | 93.75% | 62.5% | 100% |
| statsService.js | 100% | 100% | 100% |
| statsController.js | 86.95% | 100% | 100% |
| apiStatRepository.js | 100% | 100% | 100% |
| Overall project | 97.98% | 94.76% | 98.55% |

## 6. Verification

Record actual output from these commands after server start:

```bash
# Generate some traffic first
curl http://localhost:3000/api/maps
curl http://localhost:3000/api/users
curl -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","dimensions":{"width":10,"height":10}}'

# Then check stats
curl http://localhost:3000/stats/requests
curl http://localhost:3000/stats/response-times
curl http://localhost:3000/stats/status-codes
curl http://localhost:3000/stats/popular-endpoints
```

**GET /stats/requests output:**
```json
{"success":true,"data":{"total_requests":287,"breakdown":{"/api/health":{"GET":6},"/api/maps":{"GET":16,"POST":20},"/api/users/:id":{"DELETE":5,"PUT":20,"GET":10},"/api/obstacles/:id":{"DELETE":5,"PUT":10,"GET":10},"/api/maps/:id":{"DELETE":5,"PUT":15,"GET":10},"/api/users":{"GET":10,"POST":15},"/api/obstacles":{"GET":15,"POST":15},"/api/routes/:id":{"DELETE":5,"GET":10},"/api/waypoints/:id":{"DELETE":5,"PUT":10,"GET":10},"/api/routes":{"GET":15,"POST":20},"/api/waypoints":{"GET":10,"POST":15}}}}
```

**GET /stats/response-times output:**
```json
{"success":true,"data":{"/api/health":{"avg":1,"min":0,"max":1},"/api/maps":{"avg":3,"min":0,"max":23},"/api/users/:id":{"avg":1,"min":0,"max":3},"/api/obstacles/:id":{"avg":1,"min":0,"max":2},"/api/maps/:id":{"avg":2,"min":0,"max":7},"/api/users":{"avg":3,"min":0,"max":8},"/api/obstacles":{"avg":2,"min":0,"max":9},"/api/routes/:id":{"avg":1,"min":0,"max":3},"/api/waypoints/:id":{"avg":1,"min":0,"max":3},"/api/routes":{"avg":2,"min":0,"max":8},"/api/waypoints":{"avg":2,"min":0,"max":6}}}
```

**GET /stats/status-codes output:**
```json
{"success":true,"data":{"200":92,"201":25,"400":35,"404":90,"409":10,"422":5,"500":30}}
```

**GET /stats/popular-endpoints output:**
```json
{"success":true,"data":{"most_popular":"/api/maps","request_count":36,"ranked":[{"endpoint":"/api/maps","request_count":36},{"endpoint":"/api/users/:id","request_count":35},{"endpoint":"/api/routes","request_count":35},{"endpoint":"/api/maps/:id","request_count":30},{"endpoint":"/api/obstacles","request_count":30},{"endpoint":"/api/obstacles/:id","request_count":25},{"endpoint":"/api/users","request_count":25},{"endpoint":"/api/waypoints/:id","request_count":25},{"endpoint":"/api/waypoints","request_count":25},{"endpoint":"/api/routes/:id","request_count":15},{"endpoint":"/api/health","request_count":6}]}}
```

## 7. Conclusion

The tracking middleware captures every API request
non-blocking, normalizes paths for meaningful grouping,
and persists data to PostgreSQL. The four stats endpoints
expose aggregations computed using filter, map, and reduce
over raw data — following functional programming principles
consistent with the rest of the capstone codebase.

The HOF pattern is demonstrated explicitly via withTracking
(takes a function, returns a function with added behavior)
and implicitly via the res.json override in the global
middleware (wraps an existing function without modifying
the original).
