# Swagger (OpenAPI) Setup

## Context
To facilitate testing and frontend integration during development, we use Swagger UI to visualize our RESTful API endpoints.

## Tools
- `swagger-ui-express`: Serves the interactive Swagger UI.
- `swagger-jsdoc`: Generates the OpenAPI 3.0 specification by parsing JSDoc comments above our routes.

We chose this combination because it allows us to keep documentation close to the code (in route files) rather than maintaining a massive standalone YAML/JSON file, which aligns well with modularity.

## How to Access
When running the development server (`npm run dev`), you can access the documentation at:
- UI: `http://localhost:<PORT>/api-docs`
- Raw JSON: `http://localhost:<PORT>/api-docs.json`

*Note: Swagger is explicitly disabled in production (`NODE_ENV === 'production'`) for security.*

## Annotating Future Endpoints
We keep route definitions in `src/presentation/routes/`. To document an endpoint, place a `@swagger` JSDoc block right above the route declaration.

Example:

```javascript
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running successfully.
 */
router.get('/health', getHealth);
```

### Using Reusable Schemas
We have predefined standard schemas (Map, Obstacle, Waypoint, Route, User) in `src/config/swagger.js`. You should reference these in your annotations instead of redefining them:

```javascript
/**
 * ...
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Map'
 */
```
