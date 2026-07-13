const express = require('express');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());

  // Base route for health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Pathfinder Backend API is running' });
  });

  return app;
};

module.exports = { createApp };
