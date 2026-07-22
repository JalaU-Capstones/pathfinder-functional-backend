# Postman Collection

This directory contains the exported Postman collection and environment variables for the Pathfinder Functional Backend project.

## Files
- `pathfinder-api.postman_collection.json` - The collection containing all endpoints (Health, Maps, Obstacles, Waypoints, Routes, Users) with realistic examples.
- `pathfinder-local.postman_environment.json` - The environment file containing local variables like `baseUrl`, `mapId`, `userId`, etc., ensuring no hardcoded values in the requests.

## How to Import
1. Open Postman.
2. Click **Import** in the top left corner.
3. Drag and drop both `.json` files into the import window, or select them from your file system.
4. Once imported, ensure you select **Pathfinder Local** from the Environment dropdown in the top right corner of Postman.

## Usage Guide
- The endpoints are grouped by entity.
- The collection uses logical flows (POST -> GET all -> GET by id -> PUT -> DELETE).
- Run the **Health Check** request first to ensure the server is responding on `http://localhost:3000`.
- Note: The distance calculated in the Route POST endpoint uses a placeholder Manhattan distance until the final pathfinding algorithm is implemented in Phase 5B.

## How to Keep Updated
If new endpoints or entities are added in future phases:
1. Duplicate an existing folder or request in Postman.
2. Update the endpoint and payload.
3. Ensure any new IDs use environment variables (e.g. `{{newEntityId}}`).
4. Re-export both the collection and environment, and overwrite these `.json` files in this directory.
