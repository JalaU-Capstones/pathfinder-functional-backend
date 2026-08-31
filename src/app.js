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
  app.use('/api', healthRoutes);
  app.use('/api/validation', validationRoutes);

  // Protected routes (auth required)
  const { authMiddleware } = require('./presentation/middlewares/authMiddleware');
  
  app.use('/api/maps', authMiddleware, mapRoutes);
  app.use('/api/obstacles', authMiddleware, obstacleRoutes);
  app.use('/api/waypoints', authMiddleware, waypointRoutes);
  app.use('/api/routes', authMiddleware, routeRoutes);
  app.use('/api/users', authMiddleware, userRoutes);

  // Cache monitoring (protected)
  app.use('/api/cache', authMiddleware, createCacheRouter(cache));

  // Stats endpoints — kept out of /api to avoid recursive tracking (protected)
  app.use('/stats', authMiddleware, statsRoutes);

  // 404 Not Found (After routes)
  app.use(notFound);

  // Global Error Handler (End of chain)
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
