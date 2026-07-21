# Repository Pattern

## What it is
The Repository pattern abstracts the data layer (database/ORM) from the rest of the application. It provides a collection-like interface for accessing domain objects.

## Why it was chosen
In this functional architecture, we want the business logic (Services) to be as pure as possible and completely agnostic of how data is stored. By placing all Sequelize model calls into a dedicated Repository, we isolate side-effects. This allows us to:
1. Easily mock data access during unit testing of the business logic.
2. Swap out the underlying ORM or database in the future without touching the business rules.
3. Ensure a **Single Source of Truth** for database queries.

## Where it is implemented
- **Path**: `src/data/repositories/mapRepository.js`
- **Functions**: `createMap`, `getMapById`, `getAllMaps`, `updateMap`, `deleteMap`
These functions wrap the Sequelize `Map` model calls and return plain promises.

- **Path**: `src/data/repositories/obstacleRepository.js`
- **Functions**: `createObstacle`, `getObstacleById`, `getAllObstacles`, `updateObstacle`, `deleteObstacle`
These functions isolate the Sequelize `Obstacle` model calls.

- **Path**: `src/data/repositories/waypointRepository.js`
- **Functions**: `createWaypoint`, `getWaypointById`, `getAllWaypoints`, `updateWaypoint`, `deleteWaypoint`
These functions wrap the Sequelize `Waypoint` model calls.
