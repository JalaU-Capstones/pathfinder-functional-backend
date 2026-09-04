require('dotenv').config();
const { env } = require('./env');

const isLocalhost = env.dbHost === 'localhost' || env.dbHost === '127.0.0.1';

const sslConfig = isLocalhost
  ? {}
  : {
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  };

module.exports = {
  development: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'postgres',
    ...sslConfig
  },
  test: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName + '_test',
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'postgres',
    ...sslConfig
  },
  production: {
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'postgres',
    ...sslConfig
  }
};
