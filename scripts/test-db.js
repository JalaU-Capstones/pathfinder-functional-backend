const { sequelize } = require('../src/config/database');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection to PostgreSQL successful.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

testConnection();
