# Error Factory Pattern

## What it is
Instead of defining complex Object-Oriented class hierarchies for Custom Exceptions (e.g., `class NotFoundError extends Error`), we use a pure functional factory approach that returns simple JavaScript objects representing errors.

## Why it was chosen
This project strictly enforces the functional programming paradigm. OOP constructs like `class` and `extends` are avoided. The factory function generates a structured error object containing a `type` (using predefined constants), a `message`, and an `isAppError` flag. This allows controllers or global error handlers to predictably format HTTP responses (status codes and bodies) without relying on `instanceof` checks.

## Where it is implemented
- **Path**: `src/utils/errors.js`
- **Functions**: `createAppError`
- **Constants**: `ERROR_TYPES` (`NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`)
- **Usage**: Used heavily in `src/business/services/mapService.js` to throw business/validation errors, which are then caught and processed by `src/utils/httpResponse.js`.
- **Phase 4 (Waypoint CRUD):** `src/business/services/waypointService.js` throws `NOT_FOUND` if the referenced Map doesn't exist, and `VALIDATION_ERROR` for negative coordinates or empty names.
- **Phase 6 (User CRUD):** Extended the `ERROR_TYPES` explicitly adding `CONFLICT`, returning HTTP 409 from `httpResponse.js`. The `src/business/services/userService.js` uses this to throw `CONFLICT` when an email already exists.
