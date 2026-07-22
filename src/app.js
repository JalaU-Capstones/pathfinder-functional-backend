const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const healthRoutes = require('./presentation/routes/health.routes');
const mapRoutes = require('./presentation/routes/mapRoutes');
const obstacleRoutes = require('./presentation/routes/obstacleRoutes');
const waypointRoutes = require('./presentation/routes/waypointRoutes');
const routeRoutes = require('./presentation/routes/routeRoutes');
const userRoutes = require('./presentation/routes/userRoutes');
const { requestLogger } = require('./presentation/middlewares/requestLogger');
const { errorHandler } = require('./presentation/middlewares/errorHandler');
const { notFound } = require('./presentation/middlewares/notFound');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());
  
  // Request Logger (Before routes)
  app.use(requestLogger);

  // Swagger Documentation (Development Only)
  if (process.env.NODE_ENV !== 'production') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // Serve raw OpenAPI JSON
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // Routes
  app.use('/api', healthRoutes);
  app.use('/api/maps', mapRoutes);
  app.use('/api/obstacles', obstacleRoutes);
  app.use('/api/waypoints', waypointRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/users', userRoutes);

  // 404 Not Found (After routes)
  app.use(notFound);

  // Global Error Handler (End of chain)
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
