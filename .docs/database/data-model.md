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

#### 3. Obstacles
- `id`: INTEGER (PK, Auto-increment)
- `mapId`: INTEGER (FK -> Maps.id, CASCADE DELETE)
- `positionX`: INTEGER (Required)
- `positionY`: INTEGER (Required)
- `size`: INTEGER (Required)
- `createdAt` / `updatedAt`: DATE

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
