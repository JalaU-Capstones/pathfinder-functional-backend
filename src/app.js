const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const healthRoutes = require('./presentation/routes/health.routes');
const mapRoutes = require('./presentation/routes/mapRoutes');
const obstacleRoutes = require('./presentation/routes/obstacleRoutes');
const waypointRoutes = require('./presentation/routes/waypointRoutes');
const routeRoutes = require('./presentation/routes/routeRoutes');
const userRoutes = require('./presentation/routes/userRoutes');
const validationRoutes = require('./presentation/routes/validationRoutes');
const statsRoutes = require('./presentation/routes/statsRoutes');
const { requestLogger } = require('./presentation/middlewares/requestLogger');
const { errorHandler } = require('./presentation/middlewares/errorHandler');
const { notFound } = require('./presentation/middlewares/notFound');
const { trackingMiddleware } = require('./presentation/middlewares/trackingMiddleware');
const { createCacheMiddleware } = require(
  './presentation/middlewares/cacheMiddleware'
);
const { createCacheRouter } = require(
  './presentation/routes/cacheRoutes'
);

// Cache configuration - adjust max and maxAge per environment
const CACHE_CONFIG = Object.freeze({
  max: 50,
  maxAge: 30000,
});

const cache = require('./utils/lruCache').createLRUCache(CACHE_CONFIG);
const cacheMiddleware = createCacheMiddleware(CACHE_CONFIG);

const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());

  // Request Logger (Before routes)
  app.use(requestLogger);

  // LRU cache middleware (After request logger, before entity routes)
  if (process.env.NODE_ENV !== 'test') {
    app.use('/api', cacheMiddleware);
  }

  // API usage tracking — persists one row per request
  // to the ApiStats table for /stats/* endpoints
  app.use('/api', trackingMiddleware);

  // Swagger Documentation (Development Only)
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Serve raw OpenAPI JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  const authRoutes = require('./presentation/routes/authRoutes');

  // Public routes — no auth middleware applied
  app.use('/api/auth', authRoutes);

  // Entity routes
  app.use('/api', healthRoutes);
  app.use('/api/maps', mapRoutes);
  app.use('/api/obstacles', obstacleRoutes);
  app.use('/api/waypoints', waypointRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/validation', validationRoutes);

  // Cache monitoring route (After entity routes)
  app.use('/api/cache', createCacheRouter(cache));

  // Stats endpoints — kept out of /api to avoid recursive tracking
  app.use('/stats', statsRoutes);

  // 404 Not Found (After routes)
  app.use(notFound);

  // Global Error Handler (End of chain)
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
