const { createApp } = require('./app');
const { env } = require('./config/env');
const { sequelize } = require('./config/database');

const startServer = async () => {
  const app = createApp();

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
