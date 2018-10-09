'use strict';

/**
 * Response Table Schema for the database
 * Includes all the fields, their sequelize types, and
 * additional constraints (primary key, auto-increment for ID, not null,..)
 *
 * Fields:
 * id: type - integer, unique (for different questions/users/attempts), auto-assigned, auto-incremented
 * userAnswer: type - 1-character string, valid values: A, B, C, D, or number from 1-10
 * responseDateTime: type - DATE, timestamp of the date and time user response is saved in database
 *                   DEFAULT VALUE: current date/time
 *
 */

module.exports = function(dbConn, Sequelize) {
  var UserResponse = dbConn.define('UserResponse', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userAnswer: {
      type: Sequelize.STRING(1),
    },
    responseDateTime: {
      type: Sequelize.DATE,
      //defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
  });

  // This will let us use the userresponse schema and the functions defined above in other .js modules
  return UserResponse;
};
