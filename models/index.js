require('dotenv').config();
const { Sequelize } = require('sequelize');

const config = require('../config/config.json').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false, // Disable logging SQL queries (optional)
  }
);

module.exports = sequelize;
