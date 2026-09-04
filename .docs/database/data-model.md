# Data Model and Schema Definition

## Final Database Schema

This project relies on PostgreSQL and the Sequelize ORM. The entities are defined to strictly match the API definitions specified via Swagger.

### Primary Key Strategy
We opted to use **Serial Integers (`INTEGER` auto-incrementing)** for the primary key (`id`) across all entities. 
*Rationale:* The Swagger documentation defined in Phase 0 established `id` as `{ type: 'integer' }`. Using Serial Integers ensures strict parity between the database layer and API layer without requiring ID transformation.

### Entities & Columns

#### 1. Users
Users are standalone entities and are not directly related to Maps in this phase.
- `id`: INTEGER (PK, Auto-increment)
- `name`: STRING (Required)
- `age`: INTEGER (Required)
- `email`: STRING (Required, Unique)
- `createdAt` / `updatedAt`: DATE

#### 2. Maps
- `id`: INTEGER (PK, Auto-increment)
- `name`: STRING (Required)
- `width`: INTEGER (Required)
- `height`: INTEGER (Required)
- `createdAt` / `updatedAt`: DATE

## Obstacles Table (Updated: September 4, 2026)

### Schema
| Column | Type | Nullable | Description |
|---|---|---|---|
| id | UUID (PK) | No | Auto-generated UUID v4 |
| mapId | UUID (FK) | No | References Maps.id, CASCADE on delete |
| userId | UUID (FK) | Yes | References Users.id, SET NULL on delete |
| startX | INTEGER | No | Top-left X of obstacle rectangle |
| startY | INTEGER | No | Top-left Y of obstacle rectangle |
| endX | INTEGER | No | Bottom-right X (= startX for 1-cell) |
| endY | INTEGER | No | Bottom-right Y (= startY for 1-cell) |
| size | INTEGER | No | Cells occupied: (endX-startX+1)*(endY-startY+1) |
| createdAt | DATE | No | Sequelize auto timestamp |
| updatedAt | DATE | No | Sequelize auto timestamp |

### Indexes
- Primary key on id
- Foreign key index on mapId
- Foreign key index on userId
- `obstacles_start_end_x_idx` on (startX, endX)
- `obstacles_start_end_y_idx` on (startY, endY)

### Geometry model
An obstacle is a rectangle defined by two corner points:
(startX, startY) is the top-left corner.
(endX, endY) is the bottom-right corner.

For a single-cell obstacle: startX = endX, startY = endY.
For a rectangular obstacle: endX >= startX, endY >= startY.

The size field is calculated: (endX-startX+1)*(endY-startY+1)
and is always computed by the service layer. Users never
provide the size value directly.

### Cell blocking rule
A grid cell at (x, y) is blocked if:
  startX <= x <= endX  AND  startY <= y <= endY

The A* pathfinder expands each obstacle record into its
full set of blocked cells using this rule.

### API input formats
Users can create obstacles in two ways:

Single cell:
{ "x": 10, "y": 20 }

Rectangle by opposite corners:
{ "x": 5, "y": 10, "endX": 10, "endY": 15 }

The system derives startX, startY, endX, endY and
calculates size automatically.

### Previous schema (removed)
The previous schema used a JSONB position column {x, y}
and a user-provided size integer that had no effect on
the map grid. Both were replaced in migration
20260904000001-update-obstacles-rectangular.js.

#### 4. Waypoints
- `id`: INTEGER (PK, Auto-increment)
- `mapId`: INTEGER (FK -> Maps.id, CASCADE DELETE)
- `positionX`: INTEGER (Required)
- `positionY`: INTEGER (Required)
- `name`: STRING (Required)
- `createdAt` / `updatedAt`: DATE

#### 5. Routes
- `id`: INTEGER (PK, Auto-increment)
- `mapId`: INTEGER (FK -> Maps.id, CASCADE DELETE)
- `startX`: INTEGER (Required)
- `startY`: INTEGER (Required)
- `endX`: INTEGER (Required)
- `endY`: INTEGER (Required)
- `distance`: FLOAT (Required)
- `createdAt` / `updatedAt`: DATE

## Object to Column Mapping (API vs DB)
To properly represent positional data in a flat relational database while keeping the API endpoints structured, we transformed nested objects from the Swagger specification into explicit columns:
- API nested `position: { x, y }` maps to DB `positionX` and `positionY`.
- API nested `start: { x, y }` and `end: { x, y }` map to DB `startX`, `startY`, `endX`, and `endY`.

The translation between these structures will occur in the business/service layer in later phases to preserve the functional programming paradigm.

## Schema Evolution

### 2026-07-27 — Added `path` column to Routes
Migration: `20260727000000-add-path-to-routes.js`
- Column: `path` (JSONB, nullable)
- Reason: store the full A* computed coordinate array for
  retrieval without recalculation.
- Why JSONB: binary JSON enables structured storage and future
  indexed queries; Sequelize auto-serializes/deserializes arrays.
- Why nullable: backward compatibility with existing rows.

## ApiStats Table (Lab Week 8)

### Purpose
Tracks every HTTP request processed by the backend API.
Used by the statistics endpoints to compute aggregations
(total requests, response times, status codes, popular
endpoints).

### Schema
| Column | Type | Nullable | Description |
|---|---|---|---|
| id | UUID (PK) | No | Auto-generated UUID v4 |
| endpointAccess | STRING | No | Normalized route path |
| requestMethod | STRING(10) | No | HTTP method |
| statusCode | INTEGER | No | Response status code |
| responseTimeMs | INTEGER | No | Duration in ms |
| userId | STRING | Yes | Optional user identifier |
| timestamp | DATE | No | Request time (default: NOW) |
| createdAt | DATE | No | Sequelize auto timestamp |
| updatedAt | DATE | No | Sequelize auto timestamp |

### Indexes
- `api_stats_endpoint_access_idx` on endpointAccess
- `api_stats_timestamp_idx` on timestamp

### Design decisions
- One row per request (not pre-aggregated): enables
  flexible aggregation via filter/map/reduce at the
  service layer, which is the functional programming
  approach required by the lab rubric.
- responseTimeMs stored as INTEGER per row: avg/min/max
  are derived at query time using reduce, not stored.
- No FK relationships: ApiStats is an analytics table
  independent of the core entity graph.

### Migration
`src/data/migrations/20260828000001-create-api-stats.js`
