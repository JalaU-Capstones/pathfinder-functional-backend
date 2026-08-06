# Dependency Inversion Principle (DIP)

**Definition:** High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

In a functional Node.js architecture, DIP is realized through **pure functions expecting raw data** and **repository abstraction layers**.

## 1. Function Parameters as Abstractions
The most critical algorithm in the project, `calculatePath` (in `src/business/pathfinder.js`), is a high-level module. It completely inverts its dependencies.

It does **not** import Sequelize models. It does **not** call database functions. Instead, it expects plain data shapes as arguments:

```javascript
// High-level policy (pathfinding) depends ONLY on plain data (abstractions)
const calculatePath = (grid, start, end, obstacles, waypoints) => { ... }
```

The low-level module (`routeService.js`) is responsible for querying the database, shaping the data into these simple structures, and passing them to the algorithm.

## 2. Repository Abstraction Layer
The Business Layer (Services) represents the high-level policy of the application. It should not be coupled to the specific details of the database (Sequelize).

We invert this dependency using the Data Access Layer (Repositories):
- **High-level:** `mapService.js` depends on the abstraction provided by `mapRepository.js` (e.g., `getMapById(id)`).
- **Low-level:** `mapRepository.js` implements the details using Sequelize (`Map.findByPk(id)`).

If we replaced PostgreSQL and Sequelize with MongoDB and Mongoose, the high-level services would remain entirely untouched. Only the low-level repositories would change to fulfill the contract.

## 3. Error Factory Abstraction
The business layer needs to trigger HTTP errors (e.g., 404 Not Found), but it shouldn't depend on Express HTTP response objects (res.status).

Instead, it depends on an abstraction: `createAppError` from `src/utils/errors.js`.

```javascript
// mapService.js calls an abstraction, completely unaware of Express
throw createAppError(ERROR_TYPES.NOT_FOUND, `Map with ID ${id} not found.`);
```

The Presentation Layer (Express error handler) catches this standardized error and translates it into a low-level HTTP response. The business layer remains completely decoupled from the HTTP transport mechanism.
