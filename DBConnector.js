const Sequelize = require('sequelize');
var config = require('./config.js');

/**
 * Creates a new sequelize database connection
 * based on the parameters in config.js
 */
const DBConnector = new Sequelize(
  config.db_schema,
  config.db_user,
  config.db_password,
  {
    host: config.db_host,
    port: config.db_port,
    dialect: 'mysql',

    pool: {
      max: 15,
      min: 0,
      idle: 10000,
    },

    define: {
      timestamps: false,
    },
  }
);

// This connection is abstracted into DBConnector for other modules to use
module.exports = DBConnector;
