'use strict';
var sqlize = require('sequelize');
const Op = sqlize.Op;

/**
 * Quiz Table Schema for the database
 * Includes all the fields, their sequelize types, and
 * additional constraints (primary key, auto-increment for ID, not null,..)
 *
 * Fields:
 * id: type - integer, unique, auto-assigned, auto-incremented
 * percentToPass: type - integer, VALID VALUES: 1-100, DEFAULT VALUE: 60%
 */

module.exports = function(dbConn, Sequelize) {
  var Question;
  var ContentPage;
  var Attempt;
  var QuizResult;
  var Response;
  var Quiz = dbConn.define('Quiz', {
    id: {
      //unique id for the quiz
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    percentToPass: {
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 60,
    },
  });

  Quiz.associate = function(models) {
    Question = models.Question;
    ContentPage = models.ContentPage;
    Attempt = models.TrainingAttempt;
    QuizResult = models.QuizResult;
    Response = models.UserResponse;
    Quiz.belongsTo(models.ContentPage);

    Quiz.hasMany(models.Question, {
      as: {
        singular: 'question',
        plural: 'questions',
      },
      foreignKey: 'quizId',
      sourceKey: 'id',
    });
  };

  /**
   * Question table will have quizId foreign key field
   * Quiz gets functions like addQuestion(), getQuestions(), and setQuestions()
   * More info: http://docs.sequelizejs.com/class/lib/associations/base.js~Association.html
   */
  //Quiz.hasMany(Question);
  Quiz.createQuiz = function(pageID, passPercent) {
    return new Promise(function(resolve, reject) {
      Quiz.create({
        percentToPass: passPercent,
        ContentPageId: pageID,
      })
        .then(newQuiz => {
          resolve(newQuiz);
        })
        .catch(createQuizError => {
          reject(createContentPageError); // error creating content page
        });
    });
  };

  Quiz.addQuestionToQuiz = function(quizId, questionToAdd) {
    return new Promise(function(resolve, reject) {
      Quiz.getQuestionCount(quizId)
        .then(thisNum => {
          Question.create({
            points: questionToAdd.points,
            number: thisNum,
            questionType: questionToAdd.questionType,
            questionText: questionToAdd.questionText,
            choiceA: questionToAdd.choiceA,
            choiceB: questionToAdd.choiceB,
            choiceC: questionToAdd.choiceC,
            choiceD: questionToAdd.choiceD,
            correctChoice: questionToAdd.correctChoice,
          })
            .then(newQuestion => {
              Quiz.getQuizById(quizId)
                .then(quiz => {
                  if (!quiz) {
                    resolve('Quiz does not exist');
                  } else {
                    quiz
                      .addQuestion(newQuestion)
                      .then(addedQuestion => {
                        resolve(newQuestion); // or addedQuestion?
                      })
                      .catch(addError => reject(addError));
                  }
                })
                .catch(findError => reject(findError));
            })
            .catch(createError => reject(createError));
        })
        .catch(findQuizError => reject(findQuizError));
    });
  };

  Quiz.getQuestionCount = function(thisQuizId) {
    return new Promise(function(resolve, reject) {
      Question.count({ where: { quizId: thisQuizId } }).then(count => {
        resolve(count + 1);
      });
    });
  };

  Quiz.deleteQuiz = function(quiz) {
    return new Promise(function(resolve, reject) {
      if (!quiz) {
        resolve('quiz does not exist');
      } else {
        quiz
          .getQuestions()
          .then(questions => {
            let promises = questions.map(question =>
              Quiz.deleteQuestion(question.id)
            );

            Promise.all([...promises])
              .then(() => {
                quiz
                  .destroy()
                  .then(() => {
                    resolve('done');
                  })
                  .catch(quizDestroyError => {
                    reject(
                      new Error(
                        'Error destroying quiz - deleted questions however'
                      )
                    );
                  });
              })
              .catch(detroyQuestionError => {
                reject(new Error('Error deleting questions'));
              });
          })
          .catch(getQuestionsError => {
            reject(new Error('Error retrieving questions for quiz'));
          });
      }
    });
  };

  Quiz.getQuiz = function(pageId) {
    return new Promise(function(resolve, reject) {
      Quiz.findOne({
        where: {
          ContentPageId: pageId,
        },
      })
        .then(quiz => {
          resolve(quiz);
        })
        .catch(getQuizErr => {
          reject(getQuizErr);
        });
    });
  };

  Quiz.getQuizById = function(quizID) {
    return new Promise(function(resolve, reject) {
      Quiz.findOne({
        where: {
          id: quizID,
        },
      })
        .then(quiz => {
          resolve(quiz);
        })
        .catch(getQuizErr => {
          reject(getQuizErr);
        });
    });
  };

  Quiz.getAllQuestions = function(quizId) {
    return new Promise(function(resolve, reject) {
      Quiz.getQuizById(quizId).then(quiz => {
        quiz
          .getQuestions()
          .then(questions => {
            resolve(questions);
          })
          .catch(getQuestionsError => {
            reject(getQuestionsError);
          });
      });
    });
  };

  Quiz.deleteQuestion = function(questionId) {
    return new Promise(function(resolve, reject) {
      Question.findOne({ where: { id: questionId } })
        .then(questionToDelete => {
          if (!questionToDelete) {
            resolve('question does not exist');
          } else {
            questionToDelete
              .destroy()
              .then(() => {
                Question.findAll({
                  where: {
                    quizId: questionToDelete.quizId,
                    number: {
                      [Op.gt]: questionToDelete.number,
                    },
                  },
                })
                  .then(questionsToDecrement => {
                    if (questionsToDecrement) {
                      let promises = questionsToDecrement.map(curQ =>
                        Quiz.decrementQuestionNumber(curQ)
                      );
                      Promise.all([...promises])
                        .then(() => {
                          resolve('done');
                        })
                        .catch(decQuestionNumbersError => {
                          reject(
                            new Error(
                              'Error updating subsequent question numbers'
                            )
                          );
                        });
                    } else {
                      resolve('done');
                    }
                  })
                  .catch(getQuestionsToDecError => {
                    reject(
                      new Error('Error finding questions to update in training')
                    );
                  });
              })
              .catch(destroyQuestionError => {
                reject(destroyQuestionError);
              });
          }
        })
        .catch(getQuestionError => {
          reject(getQuestionError);
        });
    });
  };

  Quiz.decrementQuestionNumber = function(curQ) {
    return new Promise(function(resolve, reject) {
      curQ
        .decrement('number')
        .then(() => resolve('done'))
        .catch(error => reject(error));
    });
  };

  Quiz.getQuizInfo = function(qId) {
    return new Promise(function(resolve, reject) {
      //return info[] = trainingId, pageNum
      Question.findOne({ where: { id: qId } })
        .then(q => {
          Quiz.getQuizById(q.quizId)
            .then(quiz => {
              ContentPage.findOne({ where: { id: quiz.ContentPageId } })
                .then(page => {
                  resolve([page.trainingId, page.pageNumber]);
                })
                .catch(err => reject(err));
            })
            .catch(err2 => reject(err2));
        })
        .catch(err3 => reject(err3));
    });
  };

  Quiz.updateQuestionInQuiz = function(updatedQuestion) {
    return new Promise(function(resolve, reject) {
      Question.findOne({ where: { id: updatedPQuestion.id } })
        .then(question => {
          if (!question) reject(new Error('cannot find question to update'));
          else {
            question
              .update({
                points: updatedQuestion.points,
                questionType: updatedQuestion.questionType,
                questionText: updatedQuestion.questionText,
                updatedAt: dbConn.fn('NOW'),
                choiceA: updatedQuestion.choiceA,
                choiceB: updatedQuestion.choiceB,
                choiceC: updatedQuestion.choiceC,
                choiceD: updatedQuestion.choiceD,
                correctChoice: updatedQuestion.correctChoice,
              })
              .then(rowAffected => {
                resolve(question); // either null or question
              })
              .catch(questionUpdateError => {
                reject(new Error('Error updating question'));
              });
          }
        })
        .catch(findQuestionError => {
          reject(findQuestionError); // error retieving page
        });
    });
  };

  Quiz.isFirstQuizInCourse = function(crsId, quizId) {
    return new Promise(function(resolve, reject) {
      ContentPage.findAll({
        where: { trainingId: crsId, pageType: 'Quiz' },
        order: ['pageNumber'],
      }).then(quizPages => {
        Quiz.getQuizById(quizId)
          .then(quiz => {
            quiz
              .getContentPage()
              .then(quizPage => {
                if (firstQuizPage.pageNumber === quizPage.pageNumber) {
                  console.log(
                    'quiz is first quiz :) pageNum',
                    firstQuizPage.pageNumber
                  );
                  resolve(true);
                } else {
                  console.log('quiz is NOT first quiz :/');
                  resolve(false);
                }
              })
              .catch(getContentPageForQuizError => {
                console.log(
                  'Error finding the page for this quiz\n',
                  getContentPageForQuizError
                );
                reject(new Error('Error finding page for this quiz'));
              });
          })
          .catch(getQuizByIdError => {
            console.log('Error finding quiz with id:', quizId);
            reject(new Error('Error finding quiz with given id'));
          });
      }); /**.catch(dbFindFirstQuizError => {
          console.log('Error finding first quiz page in training\n', dbFindFirstQuizError);
      reject(new Error('Error finding quizzes in training'));
      })*/
    });
  };

  Quiz.isLastQuizInCourse = function(crsId, quizId) {
    return new Promise(function(resolve, reject) {
      ContentPage.findAll({
        where: { trainingId: crsId, pageType: 'Quiz' },
        order: ['pageNumber'],
      })
        .then(quizzes => {
          let lastQuiz = quizzes(quizzes.length - 1);
          if (lastQuiz.id === quizId) {
            console.log('quiz is last quiz :)', quizId);
            resolve(true);
          } else {
            console.log('quiz is NOT last quiz :/');
            resolve(false);
          }
        })
        .catch(getQuizByIdError => {
          console.log('Error finding quiz with id:', quizId);
          reject(new Error('Error finding quiz with given id'));
        }); /**.catch(dbFindFirstQuizError => {
          console.log('Error finding first quiz page in training\n', dbFindFirstQuizError);
      reject(new Error('Error finding quizzes in training'));
      })*/
    });
  };

  Quiz.getAttempt = function(crsId, userId, quizId) {
    return new Promise(function(resolve, reject) {
      Quiz.isFirstQuizInCourse(crsId, quizId).then(first => {
        Quiz.isLastQuizInCourse(crsId, quizId).then(last => {});
        if (first) {
          // yes, quiz is first quiz
          console.log('Quiz is first quiz\n');
          if (!last) {
            console.log('...but is not last\n');
            // quiz is first quiz but there are more quizzes in course
            // create attempt, status: in-progress (2)
            TrainingAttempt.create({
              attemptDateTime: dbConn.fn('NOW'),
              TrainingCourseId: crsId,
              UserId: userId,
              status: 2,
            })
              .then(attempt => resolve(attempt))
              .catch(createError => reject(createError));
          } else {
            // quiz is first and last quiz in course
            // create attempt, set status: done (1)
            console.log('...and is last!\n');
            TrainingAttempt.create({
              attemptDateTime: dbConn.fn('NOW'),
              TrainingCourseId: crsId,
              UserId: userId,
              status: 1,
            })
              .then(attempt => resolve(attempt))
              .catch(createError => reject(createError));
          }
        } else if (last) {
          // quiz is not first, but is last
          // retrieve attempt, get status: in-progress (2), set status: done (1)
          console.log('quiz is not first but is last\n');
          TrainingAttempt.findOne({
            TrainingCourseId: crsId,
            UserId: userId,
            status: 2,
          })
            .then(attempt => {
              if (!attempt) {
                console.log('oops, could not find attempt to update');
                reject(new Error('Error finding attempt to update'));
              } else {
                Attempt.update({ status: 1 }, { where: { id: attempt.id } })
                  .then(result => {
                    resolve(attempt);
                  })
                  .catch(attemptUpdateErr => reject(attemptUpdateErr));
              }
            })
            .catch(findError => reject(findError));
        } else {
          // quiz is neither first nor last quiz in trainingCourse
          // retrieve attempt, get/set status: in-progress (2)
          console.log('Quiz is neither first nor last\n');
          TrainingAttempt.findOne({
            TrainingCourseId: crsId,
            UserId: userId,
            status: 2,
          })
            .then(attempt => resolve(attempt))
            .catch(findError => reject(findError));
        }
      });
    });
  };

  Quiz.scoreQuiz = function(crsId, userId, quizId, responses) {
    return new Promise(function(resolve, reject) {
      Quiz.getAttempt(crsId, userId, quizId).then(attempt => {
        if (attempt) {
          // yes, quiz is first quiz
          console.log('Got attempt:', attempt.id);
        } else {
          console.log('could not find attempt :(');
          // no,
        }
      });
    });
  };

  return Quiz;
};
