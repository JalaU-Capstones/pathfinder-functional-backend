# Interface Segregation Principle (ISP)

**Definition:** Clients should not be forced to depend on interfaces they do not use.

In an OOP setting, this usually means splitting large "fat" interfaces into smaller, more specific ones. In a functional Node.js project, ISP dictates how we organize and expose modules. We should not force a consumer to import a massive, monolithic file just to access one or two functions.

## 1. Granular Repositories and Services
Rather than creating a single `database.js` or `service.js` that exports every single data and business logic function, this project segregates them by entity.

If a module needs to fetch a Map, it imports `mapRepository`. It is not forced to import obstacle, waypoint, or user functions.

```javascript
// GOOD (ISP applied): src/business/services/routeService.js
// We only import the mapRepository to check if a map exists.
// We do NOT import mapService (which would drag in Map business logic dependencies).
const mapRepository = require('../../data/repositories/mapRepository');
```

## 2. Granular Utility Files
The `src/utils/` directory is highly segregated. Functions are broken down by their core utility:
- Need to curry a function? Import from `src/utils/curry.js`.
- Need to compose a pipeline? Import from `src/utils/compose.js`.
- Need to generate an error? Import from `src/utils/errors.js`.

We actively avoid a "god" `utils.js` file. This segregation means that files only import exactly what they need, minimizing cognitive load and preventing unnecessary dependency coupling.
