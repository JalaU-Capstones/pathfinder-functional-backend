# Functional Programming Techniques

## Overview
This project strictly adheres to functional programming paradigms. In Phase 8, we explicitly introduced and isolated core FP techniques (Higher-Order Functions, Currying, and Function Composition) to improve modularity, reusability, and testability. These techniques align with the advanced requirements of the Programming 4 module.

## Higher-Order Functions (HOF)
**Definition**: A function that takes a function as an argument OR returns a function (or both).

### In this project:
- `requireNonEmpty(fieldName)` in `src/utils/routeValidators.js`: This function takes a string (the field name) and returns a complete validator function. HOF was the right tool here because it allows us to dynamically generate specific validators (like `validateMapHasObstacles` or `validateMapHasWaypoints`) without duplicating the core array-checking logic.
- `.map()` and `.filter()` in service files (e.g., `src/business/services/mapService.js`, `routeService.js`): These built-in HOFs are used extensively for data transformation (like `toApiPosition`) and shaping without mutating the original database records.
- `.map(toDbShape)` (conceptually via `toDbPosition`) used in `mapService.createMapService` to transform input obstacle/waypoint arrays to DB column shape before passing to `mapRepository.createMapWithRelations` for `bulkCreate` — pure transformation, no mutation.

## Currying
**Definition**: Transforming a function `f(a, b)` into a sequence of functions `f(a)(b)`, enabling partial application.

### In this project:
- `curry` utility in `src/utils/curry.js`: A generic helper to curry any function based on its arity.
- `isPointInGrid`, `isSamePoint`, `isWithinBound`: These domain validators are curried to allow partial application. For example, by calling `isPointInGrid(map)`, we pre-load the grid dimensions into the closure, returning a single-argument function `(point) => boolean`. This single-argument function is highly reusable and can be cleanly passed around or applied to both `start` and `end` points without re-specifying the grid.

## Function Composition
**Definition**: Combining simple, single-purpose functions into complex pipelines without using intermediate variables, creating a declarative data flow.

### In this project:
- `pipe` and `compose` utilities in `src/utils/compose.js`.
- `validateRouteContext` pipeline in `routeService.js`: We refactored sequential, imperative `if`-checks into a composed pipeline.

**Before (Imperative):**
```javascript
if (!map) throw Error('Not Found');
if (!map.obstacles || map.obstacles.length === 0) throw Error('No obstacles');
if (!isPointInGrid(map)(start)) throw Error('Invalid start');
// ...
```

**After (Composed Pipeline):**
```javascript
const validateRouteContext = pipe(
  validateMapExists,
  validateMapHasObstacles,
  validateStartInBounds,
  validateEndInBounds,
  validatePointsNotEqual
);
validateRouteContext(context);
```
The pipe version is vastly easier to extend (just add a new validator to the pipe list) and test (each validator is tested in isolation).

## Summary Table
| Technique | File | Function | Purpose |
|---|---|---|---|
| HOF | `src/utils/routeValidators.js` | `requireNonEmpty` | Generates array validators dynamically |
| HOF | `src/business/services/mapService.js` | `.map()`, `.filter()` | Transforms DB records to API shape |
| Currying | `src/utils/curry.js` | `isPointInGrid` | Pre-loads grid for reuse across start/end |
| Currying | `src/utils/curry.js` | `isSamePoint` | Checks point equality safely |
| Composition | `src/utils/compose.js` | `pipe` | Chains validators into a left-to-right pipeline |
| Composition | `src/business/services/routeService.js` | `validateRouteContext` | Ordered railway-oriented validation pipeline |
