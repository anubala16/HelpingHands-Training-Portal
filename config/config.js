module.exports = {
  development: {
    username: 'root',
    password: 'root',
    database: 'collab_data',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: 'root',
    database: 'collab_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    database: 'nc_collab',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};
