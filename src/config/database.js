const { Sequelize } = require('sequelize');
const { env } = require('./env');

const createSequelizeInstance = () => {
  return new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
    host: env.dbHost,
    port: env.dbPort,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
  });
};

const sequelize = createSequelizeInstance();

module.exports = { sequelize, createSequelizeInstance };
