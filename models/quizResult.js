'use strict';

module.exports = function(dbConn, Sequelize) {
  var QuizResult = dbConn.define('QuizResult', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
  });

  QuizResult.associate = function(models) {
    QuizResult.hasMany(models.UserResponse, {
      as: {
        singular: 'response',
        plural: 'responses',
      },
      foreignKey: 'quizResultId',
      sourceKey: 'id',
    });

    // QuizResult.belongsTo(models.Quiz);
  };

  //QuizResult.belongsTo(Quiz);

  //QuizResult.hasMany(UserResponse);

  return QuizResult;
};
