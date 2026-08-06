# Single Responsibility Principle (SRP)

**Definition:** A module or function should have only one reason to change.

In this functional Node.js project, SRP is applied rigorously across both macro-architecture and individual functions. Unlike OOP where SRP often dictates class boundaries, in a functional paradigm it dictates module and function boundaries.

## 1. Macro Level: Three-Layer Architecture
The system is divided into three distinct layers, each with a single responsibility:
- **Presentation (`src/presentation/`):** Exclusively handles HTTP request parsing and response formatting. It has no knowledge of business rules or data persistence.
- **Business Logic (`src/business/`):** Contains pure functions, data validation, and algorithms. It does not touch HTTP or Sequelize directly.
- **Data Access (`src/data/`):** Exclusively handles database interactions via Sequelize models.

## 2. Module Level: Entity Separation
Each module is restricted to a single domain entity:
- **Repositories:** Each handles DB access for ONE entity only.
  - `src/data/repositories/mapRepository.js`
  - `src/data/repositories/obstacleRepository.js`
  - `src/data/repositories/routeRepository.js`
  - `src/data/repositories/userRepository.js`
  - `src/data/repositories/waypointRepository.js`
- **Services:** Each handles business logic for ONE entity (e.g., `src/business/services/mapService.js`).
- **Controllers:** Each handles HTTP parsing for ONE entity (e.g., `src/presentation/controllers/mapController.js`).

## 3. Function Level: Pure Utilities
Every function in the `src/utils/` directory has exactly one job. For example:
- **`createAppError`** (`src/utils/errors.js`): Only constructs standardized error objects.
- **`pipe`** (`src/utils/compose.js`): Only handles left-to-right function composition.
- **`curry`** (`src/utils/curry.js`): Only handles function currying.
- **`isPointInGrid`** (`src/utils/validation.js`): Only validates coordinate boundaries.
- **`toApiPosition`** (`src/utils/shapeMapper.js`): Only shapes database structures into API-friendly objects.

## Code Example

A prime example of SRP in action is the extraction of mapping logic in `src/business/services/mapService.js`:

```javascript
// This function ONLY builds and validates obstacle records.
const buildObstacleRecords = (obstacles) => obstacles.map(obs => {
  if (!isValidObstacle(obs)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid obstacle data provided.');
  }
  return {
    size: obs.size,
    ...toDbPosition(obs.position)
  };
});

// This function ONLY coordinates the high-level creation of the Map.
// It delegates data shaping to the helper above and persistence to the repository.
const createMapService = async (mapData) => {
  validateMapInput(mapData);
  const { name, dimensions, obstacles = [], waypoints = [] } = mapData;

  const dbObstacles = buildObstacleRecords(obstacles);
  const dbWaypoints = buildWaypointRecords(waypoints);

  const mapId = await mapRepository.createMapWithRelations({
    name, width: dimensions.width, height: dimensions.height,
    obstacles: dbObstacles, waypoints: dbWaypoints
  });

  return await getMapService(mapId);
};
```
