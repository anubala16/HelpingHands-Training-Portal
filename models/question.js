'use strict';

/**
 * Question Table Schema for the database
 * Includes all the fields, their sequelize types, and
 * additional constraints (primary key, auto-increment for ID, not null,..)
 *
 * Fields:
 * id: type - integer, auto-assigned, auto-incremented
 * number: type - integer
 * points: type - integer, number of points for the question, DEFAULT VALUE - 1 point
 * questionType: type - integer, not empty, VALID VALUES: 1 - multiple-choice, 2 - T/F, 3 - rating-scale
 * questionText: type - string, not-empty, body of the question
 * choiceA: type - string, body of choice A in a multiple-choice question
 * choiceB: type - string, body of choice B in a multiple-choice question
 * choiceC: type - string, body of choice C in a multiple-choice question
 * choiceD: type - string, body of choice D in a multiple-choice question
 * correctChoice: type - 1-character string, correct answer for the question, VALID VALUES: A,B,C,D
 */

module.exports = function(dbConn, Sequelize) {
  var Question = dbConn.define('Question', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    number: {
      type: Sequelize.INTEGER.UNSIGNED,
    },
    points: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
    questionType: {
      // valid values: 1 - multiple-choice, 2 - T/F, 3 - rating-scale
      type: Sequelize.STRING,
    },
    questionText: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    choiceA: {
      type: Sequelize.STRING,
    },
    choiceB: {
      type: Sequelize.STRING,
    },
    choiceC: {
      type: Sequelize.STRING,
    },
    choiceD: {
      type: Sequelize.STRING,
    },
    correctChoice: {
      type: Sequelize.STRING(1),
    },
  });

  /**
   * Defining a one-to-many relationship between quiz and question
   * Question table gets a QuizId foreign key
   * Quiz gets getQuestions() and setQuestion()
   * @param models
   * @return
   */
  Question.associate = function(models) {
    //Question.belongsTo(models.Quiz, { onDelete: 'CASCADE' });
  };

  return Question;
};
