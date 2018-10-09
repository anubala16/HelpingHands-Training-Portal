'use strict';

module.exports = function(dbConn, Sequelize) {
  var TrainingAttempt = dbConn.define('TrainingAttempt', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    attemptDateTime: {
      type: Sequelize.DATE,
      defaultValue: dbConn.fn('NOW'),
    },
    status: {
      // 1 - done, 2 - started/in-progress
      type: Sequelize.INTEGER,
      defaultValue: 2,
    },
  });

  /**
   * Defining a one-to-many relationship between training course and content pages
   * ContentPage table gets a trainingId foreign key (renamed from default trainingCourseID)
   * TrainingCourse gets getPages() and setPages()
   * @param models
   * @return
   */
  TrainingAttempt.associate = function(models) {
    TrainingAttempt.hasMany(models.QuizResult, {
      as: {
        singular: 'Quiz',
        plural: 'Quizzes',
      },
      foreignKey: 'attemptId',
      sourceKey: 'id',
    });

    TrainingAttempt.belongsTo(models.User);

    TrainingAttempt.belongsTo(models.TrainingCourse);
  };

  //TrainingAttempt.hasMany(QuizResult);

  //TrainingAttempt.belongsTo(User);

  //TrainingAttempt.belongsTo(TrainingCourse);

  return TrainingAttempt;
};
