const Sequelize = require('sequelize');
const dbConn = require('./DBConnector');

let TrainingCourse = require('./models/trainingCourse');
let User = require('./models/user');
let ContentPage = require('./models/contentPage');
let Quiz = require('./models/quiz');
let Question = require('./models/question');
let UserResponse = require('./models/userResponse');
let QuizResult = require('./models/quizResult');
let TrainingAttempt = require('./models/trainingAttempt');

/**
 * Join table 'userResponses' (already made in './models/') is used for this many-to-many relationship
 * UserResponses table has 2 more fields: QuestionId and UserId
 * These are renamed to: questionId and userId respectively (see 'singular/plural' below)
 * User gets addQuestions(), getQuestions(), etc.
 */
User.belongsToMany(Question, {
  as: { singular: 'question', plural: 'questions' },
  through: 'userResponses',
  foreignKey: 'userId',
  otherKey: 'questionId',
});

/**
 * Join table 'userResponses' (already made in './models/') is used for this many-to-many relationship
 * UserResponses table has 2 more fields: QuestionId and UserId
 * These are renamed to: questionId and userId respectively (see 'singular/plural' below)
 * Question gets addUsers(), getUsers(), etc.
 */
Question.belongsToMany(User, {
  as: { singular: 'user', plural: 'users' },
  through: 'userResponses',
  foreignKey: 'questionId',
  otherKey: 'userId',
});

//Response.belongsTo(User);
//Response.belongsTo(QuizQuestion);

/**
 * Drops and creates all tables (including relationships defined above) using the DBConnection
 * After setting up the database, creates a 'master' admin user with many privileges
 * Reports any errors in the process as they occur
 * Closes DBConnection when done. 
 */
dbConn
  .sync({ force: true })
  .then(() => {
    let adminUser = {
      userName: 'admin',
      pwHash: 'password',
      firstName: 'admin',
      userLevel: 4,
    };

    User.createUser(adminUser)
      .then(() => {
        dbConn.close();
      })
      .catch(err => {
        console.log('Error while trying to create default admin user.');
        dbConn.close();
      });
  })
  .catch(syncError => {
    console.log('some db sync issues');
    console.log(syncError);
  });
