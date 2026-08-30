require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || 5432,
  dbUser: process.env.DB_USER || 'pathfinder_user',
  dbPassword: process.env.DB_PASSWORD || 'pathfinder_pass',
  dbName: process.env.DB_NAME || 'pathfinder_db',
};

let JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'test') {
    JWT_SECRET = 'TEST_SECRET_DO_NOT_USE_IN_PROD';
    if (!global.__JWT_WARNING_LOGGED__) {
      console.warn('⚠️ Using fallback JWT_SECRET for tests');
      global.__JWT_WARNING_LOGGED__ = true;
    }
  } else {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Add it to your .env file.'
    );
  }
}

module.exports = { env, JWT_SECRET, JWT_EXPIRES_IN };
