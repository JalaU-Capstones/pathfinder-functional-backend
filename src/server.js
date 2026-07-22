const { createApp } = require('./app');
const { env } = require('./config/env');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message} - ${error.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

const startServer = async () => {
  const app = createApp();

  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    app.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

startServer();
