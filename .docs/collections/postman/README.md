# Pathfinder Postman Collection

This directory contains the exported Postman collection and environment for the
Pathfinder Functional Backend.

## Files

| File | Purpose |
|---|---|
| `pathfinder-api.postman_collection.json` | Full collection — 58 requests, all scripts included |
| `pathfinder-local.postman_environment.json` | Local environment (baseUrl only; IDs auto-managed by scripts) |

---

## How to Import

1. Open Postman.
2. Click **Import** (top left).
3. Drop both `.json` files into the window, or browse for them.
4. Select **Pathfinder Local** from the Environment dropdown (top right).

---

## Execution Order

Run requests **top to bottom** — the scripts handle everything automatically.

| Group | Order | Requests |
|---|---|---|
| **A — POST** | 1–7 | Register, Login, Create Map, Create Obstacle, Create Waypoint (Start), Create Waypoint (End), Create Route |
| **B — GET** | 8–48 | Health, all entity reads, Cache Stats, Stats (4 endpoints), all Validation endpoints |
| **C — PUT** | 49–53 | Update Waypoint → Obstacle → Map → Profile |
| **D — DELETE** | 54–58 | Delete Route → Waypoint → Obstacle → Map → Account |

> Run in order — no manual edits, no copy-pasting IDs.

---

## Automation Scripts

Every request has two scripts automatically applied:

### Pre-request Script
- Injects `Authorization: Bearer {{jwt_token}}` if the token exists.
- Warns in the console about any missing `{{variable}}` references.

### After Response (Test) Script
- Extracts and saves IDs from every `2xx` response.
- Asserts that the response is a success (2xx).

---

## Collection Variables (auto-managed)

| Variable | Set By | Used By |
|---|---|---|
| `jwt_token` | POST Login / POST Register | All subsequent requests (auto-injected) |
| `userId` | POST Register / POST Login (`data.user.id`) | PUT/DELETE Profile |
| `mapId` | POST Create Map (`data.id`) | POST Obstacle, POST Waypoints, POST Route, GET/PUT/DELETE Map |
| `obstacleId` | POST Create Obstacle (`data.id`) | GET/PUT/DELETE Obstacle |
| `startWaypointId` | POST Create Waypoint (Start) — body `name` contains "start" | POST Route body, GET/PUT/DELETE Waypoint |
| `endWaypointId` | POST Create Waypoint (End) — body `name` contains "end" | POST Route body |
| `waypointId` | Any other waypoint creation | Generic waypoint operations |
| `routeId` | POST Create Route (`data.id`) | GET/DELETE Route |
| `baseUrl` | Environment file | All requests |

**How waypoint start/end detection works:** the After Response script reads the
`name` field from the request body. If it contains "start" (case-insensitive),
it saves to `startWaypointId`. If it contains "end", it saves to
`endWaypointId`. Otherwise it saves to `waypointId`.

---

## Authentication

All endpoints except `GET /api/health` require JWT authentication.
1. Run **POST Register** or **POST Login** first.
2. The script auto-saves the JWT to `jwt_token`.
3. All subsequent requests auto-inject `Authorization: Bearer {{jwt_token}}`.

Token expiry: 7 days. Re-run login if you receive a 401.

---

## Stats Endpoints

Stats are now mounted at `/api/stats/*` (previously `/stats/*`):

| Endpoint | Description |
|---|---|
| `GET /api/stats/requests` | Total requests and per-endpoint/method breakdown (your data only) |
| `GET /api/stats/response-times` | Avg / min / max response time per endpoint (your data only) |
| `GET /api/stats/status-codes` | Count of each HTTP status code returned (your data only) |
| `GET /api/stats/popular-endpoints` | Endpoints ranked by request count (your data only) |

Stats are **per-user** — each authenticated user sees only their own tracking data.
All four endpoints require the `jwt_token` collection variable to be set.

---

## Collection Changelog

- **2026-09-02:** Fix stats paths from `/stats/*` → `/api/stats/*`. Reorder all
  58 requests into strict POST → GET → PUT → DELETE sequence. Add Pre-request and
  After Response scripts to every request. Switch from environment variables to
  collection variables for all auto-managed IDs. Add two `Create Waypoint`
  requests (Start and End) and update `Create Route` body to use
  `{{startWaypointId}}` and `{{endWaypointId}}`. Add `GET Cache Stats` endpoint.
- **2026-08-31:** Added Auth folder with Register and Login endpoints.
  JWT tokens auto-saved via test scripts.
- **2026-08-28:** Added Stats folder with 4 requests.
- **2026-08-18:** Added 8 Validation requests for Assignment 7.4.
- **2026-07-27:** Updated Route responses to include `optimal_path` array.
