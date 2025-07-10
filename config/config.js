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
    use_env_variable: 'postgresql://esi_flow_db_3ihs_user:0gC8NNeR9nQwXqygzzLOvkHMxMXOsKGv@dpg-d1o01f6r433s73be3en0-a/esi_flow_db_3ihs',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Needed for Render or other hosted DBs
      },
    },
  },
};
