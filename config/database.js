const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Disable logging for cleaner output
  }
);

module.exports = sequelize;
// The code above creates a new Sequelize instance and exports it. The instance is configured with the database name, user, password, host, and dialect from the .env file. The logging option is set to false to disable logging for cleaner output.