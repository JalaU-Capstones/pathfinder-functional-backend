const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const healthRoutes = require('./presentation/routes/health.routes');
const mapRoutes = require('./presentation/routes/mapRoutes');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());

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

  return app;
};

module.exports = { createApp };
