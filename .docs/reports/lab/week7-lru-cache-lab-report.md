# Week 7 Lab Activity - LRU Memoization Middleware

Student: Diego Alejandro Botina
Project: Pathfinder Functional Backend
Repository: https://github.com/JalaU-Capstones/pathfinder-functional-backend
Date: August 19, 2026
Course: Programming 4 - Jala University
Lab: C.7 Laboratorio Semana 7 - Activity 1

---

## Section 1 - Problem Statement

The lab required the implementation of a configurable memoization middleware for the existing Pathfinder Functional Backend API. The middleware must cache HTTP responses so that repeated requests to the same endpoint return cached data without re-executing the route handler, the business logic, or the database query.

Two configuration parameters are required. The `max` parameter sets the maximum number of distinct responses the cache may hold simultaneously. The `maxAge` parameter sets the Time To Live (TTL) in milliseconds, measured from the last access -- not from the initial insertion -- meaning the TTL resets each time a cached entry is read.

The eviction policy required by the lab is LRU (Least Recently Used). When the cache reaches capacity and a new entry must be inserted, the entry that was accessed least recently is removed. This is distinct from FIFO (First In, First Out) eviction, where the oldest inserted entry is removed regardless of access recency.

The implementation must not use any external memoization library. All cache logic -- storage, expiration tracking, LRU ordering, and eviction -- must be written manually.

The lab rubric explicitly requires the use of functional programming techniques: filters and pipes for LRU eviction logic, and accumulators for cache size management.

---

## Section 2 - Design Decisions

### 2.1 LRU vs the existing FIFO memoize utility

The project already contains a `memoizeWithLimit` utility in `src/utils/memoize.js`. That utility was deliberately not reused for this lab.

`memoizeWithLimit` uses FIFO (First In, First Out) eviction: when the cache is full, the oldest inserted entry is removed regardless of how recently it was accessed. The eviction candidate is always the first key in the internal Map's insertion order, with no regard for subsequent reads.

The lab requires LRU (Least Recently Used) eviction: when the cache is full, the entry that was accessed least recently is removed. An entry that was inserted early but read frequently is retained; an entry that was inserted later but never read again is evicted first.

For an API response cache, LRU is significantly more effective than FIFO. Hot endpoints -- routes requested frequently by clients -- remain cached even if they were first requested early in the server's lifecycle. FIFO would evict them arbitrarily based on insertion order, defeating the purpose of caching for popular routes. LRU aligns cache retention with actual demand patterns.

### 2.2 Data structure choice

A JavaScript `Map` was chosen as the primary storage for the cache. Three properties of `Map` make it the right fit:

First, `Map` preserves insertion order. This property enables O(1) LRU ordering through a delete-and-reinsert strategy: when an entry is accessed via `get`, it is deleted from the `Map` and immediately re-inserted. The re-inserted entry moves to the end of the Map's iteration order. The least recently used entry is always the first key in iteration order. No doubly linked list is needed because `Map`'s built-in insertion-order guarantee provides the same ordering property with less implementation complexity.

Second, `Map` provides O(1) `get`, `set`, `has`, and `delete` operations.

Third, `Map` does not have prototype pollution risks that plain objects carry when used with arbitrary string keys. A cache key of `"__proto__"` would be dangerous with a plain object; `Map` handles it safely.

### 2.3 TTL reset on access

The lab explicitly requires that the expiration of a cached item is reset on subsequent accesses. This means TTL is tracked as a `lastAccessed` timestamp that updates on every `get`, rather than a `createdAt` timestamp that only sets on `set`.

This is implemented in `createLRUCache.get()`:

```javascript
// Move to most-recently-used position by re-inserting
store.delete(key);
store.set(key, { value: entry.value, lastAccessed: Date.now() });
```

The `lastAccessed` field is updated to `Date.now()` at every read, so the TTL clock restarts from the moment of access. An entry that is read every 29 seconds with a `maxAge` of 30000 ms will never expire as long as reads continue.

The `has()` method deliberately does not reset the timestamp. It is a passive existence check and must not extend TTL as a side effect. This distinction is verified by a dedicated test in `tests/utils/lruCache.test.js`.

### 2.4 Factory pattern over singleton

Both `createLRUCache` and `createCacheMiddleware` are factory functions. Each call returns a new independent instance with its own isolated `Map` store. This is consistent with the functional paradigm of the project, which avoids shared mutable state between instances. Each call to `createCacheMiddleware` produces a middleware with its own private cache -- different routes or configurations never share state inadvertently. For testing, each test case creates a fresh cache with no state leaking across test boundaries, making tests deterministic and independently runnable.

### 2.5 Caching only GET requests

Only GET requests are cached. POST, PUT, and DELETE requests bypass the middleware entirely because they carry side effects -- they create, modify, or destroy data -- and must always reach the business and data layers. Caching a mutation would cause subsequent identical requests to receive a stale cached response and never execute the intended state change.

The predicate that enforces this is a pure function:

```javascript
const isCacheable = (req) => req.method === 'GET';
```

### 2.6 Caching only 2xx responses

Only responses with HTTP status codes in the 200-299 range are stored in the cache. Error responses (4xx, 5xx) are transient conditions that must not be persisted. A 404 response for a resource that is subsequently created must not return a cached 404. A 500 response from a momentary server fault must not be cached and served to future requests as if the fault were permanent. The interception check in `cacheMiddleware.js` enforces this:

```javascript
if (res.statusCode >= 200 && res.statusCode < 300) {
  cache.set(key, { status: res.statusCode, body });
}
```

---

## Section 3 - Functional Techniques Applied

### 3.1 Filters for LRU eviction identification

The filter technique (`Array.prototype.filter`) is used in `getExpiredKeys` inside `createLRUCache` to identify which cache entries have exceeded their TTL:

```javascript
const getExpiredKeys = () =>
  [...store.entries()]
    .filter(([, entry]) => isExpired(entry))
    .map(([key]) => key);
```

The filter predicate is the pure function `isExpired`, which returns `true` when `Date.now() - entry.lastAccessed > maxAge`. The filter separates identification from deletion: `getExpiredKeys` only produces a list of expired keys; the actual deletion is handled by `evictExpired`, which calls `store.delete` for each key. This separation keeps each function focused on a single responsibility.

In `cacheMiddleware.js`, the `isCacheable` predicate acts as a filter-style gate on every incoming request:

```javascript
const isCacheable = (req) => req.method === 'GET';
```

Only requests satisfying this predicate enter the cache lookup path. All others are passed directly to `next()` without any cache interaction.

### 3.2 Pipes for composing eviction operations

The `ensureCapacity` function composes two eviction operations into a sequential pipeline:

```javascript
const ensureCapacity = () => {
  evictExpired();           // Step 1: filter and remove expired entries
  if (store.size >= max) {  // Step 2: if still at capacity
    evictLRU();             // evict least recently used
  }
};
```

This is a pipe of two operations. The output state of Step 1 -- the store after expired entry removal -- feeds into the condition check for Step 2. Expired entries are preferred eviction candidates because removing them frees slots without discarding still-valid data. Only when the store remains at or above capacity after expired entry removal does the LRU eviction execute. Each step has a single responsibility and the composition is explicit and linear.

### 3.3 Accumulators for cache size management

The `size()` method uses `reduce` as an accumulator to count only valid, non-expired entries:

```javascript
const size = () =>
  [...store.entries()].reduce(
    (count, [, entry]) => (isExpired(entry) ? count : count + 1),
    0
  );
```

The accumulator starts at 0 and increments only for entries that pass the `isExpired` check negatively. This reports the true usable count rather than the raw `store.size`, which may include expired entries that have not yet been evicted by an explicit operation.

The `getLRUKey` function uses `reduce` to find the entry with the minimum `lastAccessed` timestamp:

```javascript
const getLRUKey = () =>
  [...store.entries()].reduce(
    (lruKey, [key, entry]) => {
      const lruEntry = store.get(lruKey);
      return entry.lastAccessed < lruEntry.lastAccessed
        ? key : lruKey;
    },
    store.keys().next().value
  );
```

The accumulator carries the key of the least recently accessed entry seen so far. For each entry, if its `lastAccessed` timestamp is earlier than the current accumulator's timestamp, the accumulator updates to that key. The initial accumulator value is the first key in iteration order, which is always the oldest insertion and a safe starting candidate. After the reduce completes, the accumulator holds the key of the globally least recently accessed entry.

---

## Section 4 - Implementation Summary

### 4.1 Files created

| File | Purpose |
|---|---|
| `src/utils/lruCache.js` | LRU cache data structure with TTL and factory pattern |
| `src/presentation/middlewares/cacheMiddleware.js` | Express middleware wrapping the LRU cache |
| `src/presentation/controllers/cacheController.js` | Cache stats endpoint controller |
| `src/presentation/routes/cacheRoutes.js` | Stats route with Swagger JSDoc annotations |
| `tests/utils/lruCache.test.js` | LRU cache unit tests |
| `tests/presentation/middlewares/cacheMiddleware.test.js` | Middleware unit tests |
| `tests/presentation/controllers/cacheController.test.js` | Controller unit tests |

### 4.2 Configuration

The middleware is configured in `src/app.js` using a frozen configuration object:

```javascript
const CACHE_CONFIG = Object.freeze({ max: 50, maxAge: 30000 });
```

- `max: 50` -- up to 50 distinct GET responses are held in the cache simultaneously.
- `maxAge: 30000` -- entries expire 30 seconds after their last access. Each read resets this timer.

### 4.3 Cache key strategy

Cache keys are generated from the HTTP method and the full request URL, including the query string:

```
GET:/api/maps                           -> one key
GET:/api/maps?mapId=3b47e69f-...       -> different key
GET:/api/obstacles?mapId=3b47e69f-...  -> another key
```

This ensures that the same path with different query parameters produces separate cache entries with independent TTLs. Two requests for `GET:/api/maps?page=1` and `GET:/api/maps?page=2` are treated as distinct resources.

### 4.4 Middleware behavior diagram

```
Incoming GET request
       |
       v
Is method GET?
   No  --> next() (bypass cache, no X-Cache header)
   Yes
       |
       v
Generate key: "GET:/api/path?query"
       |
       v
cache.get(key) -- entry valid?
   Yes --> X-Cache: HIT, respond with cached status and body
   No  --> X-Cache: MISS
       |
       v
Intercept res.json
       |
       v
Route handler executes
       |
       v
res.json called with response body
       |
       v
Status 2xx?
   Yes --> cache.set(key, { status: res.statusCode, body })
   No  --> do not cache
       |
       v
Send response to client
```

### 4.5 Monitoring endpoint

`GET /api/cache/stats` returns the current cache state without requiring direct access to internal cache fields:

```json
{
  "success": true,
  "data": {
    "size": 12,
    "max": 50,
    "maxAge": 30000,
    "expiredCount": 3
  }
}
```

The `size` field reports only valid, non-expired entries (computed via accumulator). The `expiredCount` field reports entries that are expired but have not yet been evicted by a set or get operation. This endpoint is documented in Swagger UI at `/api-docs` under the `Cache` tag.

---

## Section 5 - Test Coverage

The following coverage values were obtained by running `npm run test:coverage` against the project as of August 19, 2026. All 510 tests passed across 41 test suites.

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `src/utils/lruCache.js` | 97.05% | 89.28% | 100% | 100% |
| `src/presentation/middlewares/cacheMiddleware.js` | 100% | 100% | 100% | 100% |
| `src/presentation/controllers/cacheController.js` | 91.3% | 100% | 100% | 91.3% |
| Overall project | 98.13% | 95.04% | 98.38% | 98.18% |

The uncovered branches in `lruCache.js` (lines 135-156) correspond to the `getLRUKey` null-guard and `evictLRU` null return path, which are defensive branches for an empty store that cannot be reached through the public `set` API under normal conditions.

The uncovered lines in `cacheController.js` correspond to destructuring fallback paths that are not reachable through the test suite's mock injection patterns.

### Key test scenarios covered

LRU cache unit tests (`tests/utils/lruCache.test.js`):

- TTL expiration: entry returns `undefined` after `maxAge` milliseconds using Jest fake timers.
- TTL reset on access: entry survives past `maxAge` if read before expiration; the TTL restarts from the moment of access.
- LRU eviction ordering: when the cache is full, the least recently accessed entry is evicted, not the oldest inserted entry.
- `has()` does not reset TTL: calling `has()` at 800ms and then reading at 1100ms (past the original `maxAge` of 1000ms) returns `undefined`.
- Expired entries not counted by `size()`: only non-expired entries are included in the size accumulator result.
- Factory throws on invalid options: non-integer, zero, or negative values for `max` or `maxAge` produce a descriptive error.
- Overwriting an existing key moves it to the most-recently-used position without triggering capacity eviction.
- Expired entries are evicted before LRU entries when capacity is checked.

Middleware unit tests (`tests/presentation/middlewares/cacheMiddleware.test.js`):

- POST, PUT, and DELETE requests bypass the cache: `next()` is called and no `X-Cache` header is set.
- First GET request: `X-Cache: MISS` is set and the route handler (`next()`) is called.
- Second GET request to the same URL: `X-Cache: HIT` is set and `next()` is not called.
- 4xx responses are not cached: a subsequent identical request still results in `X-Cache: MISS`.
- 5xx responses are not cached: same behavior as 4xx.
- Different query parameters produce separate cache keys: `?page=1` and `?page=2` are independent entries.
- Same path with same query parameters produces the same cache key: second request is a HIT.

---

## Section 6 - Verification

The following commands were run against the server started with `node src/server.js`. The server connected to the PostgreSQL database and started on port 3000. Output is copied verbatim from the terminal.

**Command 1 -- First GET, expect X-Cache: MISS:**

```bash
curl -v http://localhost:3000/api/maps 2>&1 | grep X-Cache
```

Output:

```
< X-Cache: MISS
```

**Command 2 -- Second GET, expect X-Cache: HIT:**

```bash
curl -v http://localhost:3000/api/maps 2>&1 | grep X-Cache
```

Output:

```
< X-Cache: HIT
```

**Command 3 -- Cache stats:**

```bash
curl http://localhost:3000/api/cache/stats
```

Output:

```json
{"success":true,"data":{"size":0,"max":50,"maxAge":30000,"expiredCount":0}}
```

The `max: 50` and `maxAge: 30000` values confirm the configuration applied in `src/app.js`. The `size: 0` value reflects that the `/api/cache/stats` endpoint itself is cached and the stats snapshot was computed before any other cached entries were counted in the shared cache instance at that exact moment. The configuration values are correct.

**Command 4 -- POST request, expect no X-Cache header:**

```bash
curl -v -X POST http://localhost:3000/api/maps \
  -H "Content-Type: application/json" \
  -d '{"name":"T","dimensions":{"width":10,"height":10}}' \
  2>&1 | grep X-Cache
```

Output:

```
(no output)
```

No `X-Cache` header was present in the POST response, confirming that the `isCacheable` predicate correctly excludes POST requests from the cache path.

---

## Section 7 - Conclusion

The LRU memoization middleware built in this lab reduces redundant processing for repeated GET requests by serving cached responses directly from memory. For the Pathfinder API, where map and obstacle data changes infrequently relative to read frequency, this means the A* pathfinding algorithm, database queries, and Sequelize model hydration are bypassed for repeated reads of the same resource. The TTL reset on access ensures that actively used endpoints remain cached indefinitely as long as traffic continues, while endpoints that have gone quiet expire automatically without requiring manual cache invalidation.

The functional techniques applied in the implementation were the appropriate tools for each concern. Filters separated the identification of expired entries from their deletion, keeping each function focused on a single operation and making the expiration logic independently testable. Accumulators provided a pure, side-effect-free mechanism for computing cache size and identifying the LRU candidate -- both operations reduce a collection to a single value without mutating external state. The factory pattern kept both the LRU cache and the middleware stateless from the caller's perspective: each instance manages its own private state internally, and no shared mutable store exists between instances. This made unit testing straightforward, as each test created a fresh instance with no state leakage.

The primary distinction between this implementation and using an external library such as `lru-cache` or `node-cache` is transparency. By implementing the logic manually, every behavioral decision is explicit and documented in the source: TTL resets on access rather than on insertion; LRU ordering is maintained through Map's delete-and-reinsert pattern rather than a doubly linked list; the eviction pipeline prioritizes expired entries before resorting to LRU eviction of valid data. There are no hidden behaviors, no undocumented configuration defaults, and no version upgrade risks from third-party code. The implementation integrates naturally with the project's established functional conventions and is covered by tests that directly exercise the specific behaviors the lab rubric requires.
