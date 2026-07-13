require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbUser: process.env.DB_USER || 'pathfinder_user',
  dbPassword: process.env.DB_PASSWORD || 'pathfinder_pass',
  dbName: process.env.DB_NAME || 'pathfinder_db',
};

module.exports = { env };
