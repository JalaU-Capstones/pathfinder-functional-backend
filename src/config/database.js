const { Sequelize } = require('sequelize');
const { env } = require('./env');

const createSequelizeInstance = () => {
  const isLocalhost = env.dbHost === 'localhost' || env.dbHost === '127.0.0.1';

  const sslOptions = isLocalhost
    ? false
    : {
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    };

  return new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    ...sslOptions
  });
};

const sequelize = createSequelizeInstance();

module.exports = { sequelize, createSequelizeInstance };
