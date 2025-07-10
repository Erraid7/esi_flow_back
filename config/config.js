require('dotenv').config();

module.exports = {
  development: {
    username: 'postgres',
    password: 'your_password',
    database: 'esi_flow_db',
    host: 'localhost',
    dialect: 'postgres',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
