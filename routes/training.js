var express = require('express');
var router = express.Router();

var models = require('../models');
var TrainingCourse = models.TrainingCourse;
var Quiz = models.Quiz;

// Training Homepage for any user
router.get('/TrainingHome', function(req, res) {
  res.render('TrainingHome', { pageTitle: 'Welcome to Training' });
});

// List of available trainings for any user
router.get('/TrainingCourses', function(req, res) {
  TrainingCourse.getAllCourses()
    .then(trainingCourses => {
      res.render('TrainingCourses', {
        pageTitle: 'Your Training Courses',
        trainingCourses,
      });
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

// Completed Training page for any user
router.get('/CompletedTraining', function(req, res) {
  res.render('CompletedTraining', { pageTitle: 'Your Completed Trainings' });
});

// Training Homepage for any user
router.get('/TrainingResults/:id', function(req, res) {
  res.render('TrainingResults', { pageTitle: 'End of Training' });
});

/**
 * Allow Admins to Manage trainings
 * function gets all trainings stored in the database
 * so they can be displayed on the page
 */
router.get('/ManageTrainings', function(req, res) {
  TrainingCourse.getAllCourses()
    .then(trainingCourses => {
      res.render('ManageTrainings', {
        pageTitle: 'Manage Trainings',
        trainingCourses,
      });
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

// Allow Admins to edit a specific existing trainings
router.get('/EditTraining/:id', function(req, res) {
  TrainingCourse.getCourseById(req.params.id)
    .then(training => {
      TrainingCourse.getPagesInOrder(req.params.id).then(pages => {
        let pageNum = pages.length + 1;
        let trainingId = req.param.id;
        res.render('EditTraining', {
          pageTitle: 'Edit Training',
          training,
          pages,
          pageNum,
          trainingId,
        });
      });
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

// Allow Admins to add a new training with no content pages
router.get('/AddTraining', function(req, res) {
  res.render('AddTraining', { pageTitle: 'Create New Training' });
});

// Allow Admins to add/edit a quiz page to an existing trainings
router.get('/AddQuizPage/:id/add/:pageNum', function(req, res) {
  let pageId = req.params.pageNum;
  let trainingId = req.params.id;
  TrainingCourse.getPagesInOrder(req.params.id)
    .then(pages => {
      let page = pages[Number(req.params.pageNum) - 1];
      let edit = true;
      let quizPage = null;
      let questions = null;
      if (page == null) {
        edit = false;
        res.render('AddQuizPage', {
          pageTitle: 'Create Quiz',
          pageId,
          trainingId,
          page,
          edit,
          quizPage,
          questions,
        });
      } else if (page.pageType == 'Quiz') {
        Quiz.getQuiz(page.id).then(quizPage => {
          Quiz.getAllQuestions(quizPage.id).then(questions => {
            res.render('AddQuizPage', {
              pageTitle: 'Create Quiz',
              pageId,
              trainingId,
              page,
              edit,
              quizPage,
              questions,
            });
          });
        });
      } else {
        res.render('AddQuizPage', {
          pageTitle: 'Create Quiz',
          pageId,
          trainingId,
          page,
          edit,
          quizPage,
          questions,
        });
      }
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

// Allow Admins to add/edit a timeline page to an existing trainings
router.get('/AddTimelinePage/:id/add/:pageNum', function(req, res) {
  let pageId = req.params.pageNum;
  let trainingId = req.params.id;
  TrainingCourse.getPagesInOrder(req.params.id)
    .then(pages => {
      let page = pages[Number(req.params.pageNum) - 1];
      let edit = true;
      if (page == null) {
        edit = false;
      }
      res.render('AddTimelinePage', {
        pageTitle: 'Create Timeline',
        pageId,
        trainingId,
        page,
        edit,
      });
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

// Allow Admins to add/edit a lesson page to an existing trainings
router.get('/AddLessonPage/:id/add/:pageNum', function(req, res) {
  let pageId = req.params.pageNum;
  let trainingId = req.params.id;
  TrainingCourse.getPagesInOrder(req.params.id)
    .then(pages => {
      let page = pages[Number(req.params.pageNum) - 1];
      let edit = true;
      if (page == null) {
        edit = false;
      }
      res.render('AddLessonPage', {
        pageTitle: 'Create Lesson',
        pageId,
        trainingId,
        page,
        edit,
      });
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

// Allow Users to take an existing training page by page
router.get('/TakeTraining/:id/page/:pageNum', function(req, res) {
  TrainingCourse.getCourseById(req.params.id)
    .then(training => {
      TrainingCourse.getPagesInOrder(req.params.id).then(pages => {
        let firstPage = false;
        let finalPage = false;
        let prePage = Number(req.params.pageNum) - 1;
        let nextPage = Number(req.params.pageNum) + 1;
        let trainingId = req.params.id;
        let page = pages[Number(req.params.pageNum) - 1];
        let pageJSON = JSON.stringify(page.contentJSON);
        let quiz = null;
        let questions = null;
        if (page.pageNumber == 1) firstPage = true;
        if (page.pageNumber == pages.length) finalPage = true;
        if (page.pageType == 'Quiz') {
          Quiz.getQuiz(page.id)
            .then(quiz => {
              Quiz.getAllQuestions(quiz.id)
                .then(questions => {
                  res.render('TakeTraining', {
                    pageTitle: training.courseName,
                    layout: false,
                    trainingId,
                    nextPage,
                    page,
                    prePage,
                    pageJSON,
                    firstPage,
                    finalPage,
                    questions,
                  });
                })
                .catch(err => {
                  throw err;
                });
            })
            .catch(err => {
              throw err;
            });
        } else {
          res.render('TakeTraining', {
            pageTitle: training.courseName,
            layout: false,
            trainingId,
            nextPage,
            page,
            prePage,
            pageJSON,
            firstPage,
            finalPage,
            questions,
          });
        }
      });
    })
    .catch(errors => {
      res.status(500).send(errors);
    });
});

router.post('/EditTraining/:id', function(req, res) {
  let courseName = req.body.courseName;
  let estTime = req.body.estTime;
  let desc = req.body.description;
  let errors = [];
  TrainingCourse.validateReq(req.body.courseName, req.body.estTime, errors)
    .then(() => {
      var editedCourse = {
        id: req.params.id,
        courseName: courseName,
        courseDesc: desc,
        estMinutes: estTime.trim(),
      };
      TrainingCourse.updateCourse(editedCourse).then(result => {
        req.flash('success_msg', 'Course has been updated.');
        res.redirect('/training/EditTraining/' + req.params.id);
      });
    })
    .catch(errors => {
      res.render('/training/EditTraining/' + req.params.id, { errors: errors });
    });
});

// Create a new training with no content pages
router.post('/AddTraining', function(req, res) {
  let courseName = req.body.courseName;
  let estTime = req.body.estTime;
  let desc = req.body.description;
  let errors = [];
  TrainingCourse.validateReq(req.body.courseName, req.body.estTime, errors)
    .then(() => {
      var course = {
        courseName: courseName,
        courseDesc: desc,
        estMinutes: estTime.trim(),
      };
      TrainingCourse.createCourse(course).then(result => {
        req.flash('success_msg', 'New Course has been created.');
        res.redirect('/training/EditTraining/' + result.id);
      });
    })
    .catch(errors => {
      res.render('AddTraining', { errors: errors });
    });
});

// Create a Quiz and add it to a specific training
router.post('/AddQuizPage', function(req, res) {
  var content = {
    pageType: 'Quiz',
    contentJSON: null,
    pageNumber: Number(req.body.pageId),
    pageDesc: req.body.pageDesc,
  };
  let pageId = req.body.pageId;
  let trainingId = req.body.trainingId;
  TrainingCourse.addPage(trainingId, content)
    .then(result => {
      Quiz.createQuiz(result.id, Number(req.body.passPercent)).then(newQuiz => {
        req.flash('success_msg', 'Quiz has been created.');
        res.redirect('/training/AddQuizPage/' + trainingId + '/add/' + pageId);
      });
    })
    .catch(err => {
      throw err;
    });
});

// Create a question and add it to a specific quiz
router.post('/AddQuizQuestion', function(req, res) {
  let qType = req.body.questionType;
  let content;
  if (qType == 'multChoice') {
    content = {
      questionType: 'Multiple Choice',
      questionText: req.body.multQuestion,
      choiceA: req.body.op1,
      choiceB: req.body.op2,
      choiceC: req.body.op3,
      choiceD: req.body.op4,
      correctChoice: req.body.multAnswer,
    };
  } else if (qType == 'trueFalse') {
    content = {
      questionType: 'True/False',
      questionText: req.body.tfQuestion,
      choiceA: 'True',
      choiceB: 'False',
      correctChoice: req.body.tfRadio,
    };
  } else if (qType == 'rating') {
    content = {
      points: 0,
      questionType: 'Rating Scale',
      questionText: req.body.ratingQuestion,
    };
  }
  let pageId = req.body.pageId2;
  let trainingId = req.body.trainingId2;
  Quiz.addQuestionToQuiz(Number(req.body.quizId), content)
    .then(result => {
      res.redirect('/training/AddQuizPage/' + trainingId + '/add/' + pageId);
    })
    .catch(err => {
      throw err;
    });
});

// create a timeline and add it to a specific training
router.post('/AddTimelinePage', function(req, res) {
  let jsonString = req.body.jsonTimeline;
  let jsonTitle = req.body.timelineTitle;
  let trainingId = req.body.trainingId;
  let pageId = req.body.pageId;
  if (jsonString === 'No Event') {
    req.flash(
      'error_msg',
      'Form Reset. You need at least one event to make a timeline.'
    );
    res.redirect('/training/AddTimelinePage/' + trainingId + '/add/' + pageId);
    return;
  } else {
    var event = JSON.parse(jsonString);
  }
  if (jsonTitle == 'No title') {
  } else {
    var titlePage = JSON.parse(jsonTitle);
  }
  var content = {
    pageType: 'Timeline',
    pageNumber: Number(req.body.pageId),
    pageDesc: req.body.pageDesc,
    contentJSON: {
      title: titlePage,
      events: event,
    },
  };

  TrainingCourse.addPage(trainingId, content)
    .then(result => {
      req.flash('success_msg', 'Timeline has been created.');
      res.redirect('/training/EditTraining/' + trainingId);
    })
    .catch(err => {
      throw err;
    });
});

// Delete a question
router.post('/DeleteQuestion', function(req, res) {
  let qId = req.body.questionId;
  let trainingId = req.body.trainingId;
  let pageNum = req.body.pageNum;
  Quiz.getQuizInfo(qId)
    .then(info => {
      Quiz.deleteQuestion(qId)
        .then(result => {
          req.flash('success_msg', 'Question deleted.');
          res.redirect('/training/AddQuizPage/' + info[0] + '/add/' + info[1]);
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err2 => {
      throw err2;
    });
});

// Delete a content page from a training
router.post('/DeletePage', function(req, res) {
  let trainingId = req.body.trainingId;
  let pageNum = req.body.pageNum;
  TrainingCourse.deletePage(trainingId, pageNum)
    .then(result => {
      req.flash('success_msg', 'Page deleted.');
      res.redirect('/training/EditTraining/' + trainingId);
    })
    .catch(err => {
      throw err;
    });
});

// Delete a training
router.post('/DeleteTrainingCourse', function(req, res) {
  let trainingId = req.body.trainingId;
  TrainingCourse.deleteCourse(trainingId)
    .then(result => {
      req.flash('success_msg', 'Training Course deleted.');
      res.redirect('/training/ManageTrainings');
    })
    .catch(err => {
      throw err;
    });
});

// Move Up/Down the postion of a content page within a training
router.post('/SwapPages', function(req, res) {
  let trainingId = req.body.trainingId;
  let pageNum1 = req.body.pageNum1;
  let pageNum2 = req.body.pageNum2;
  TrainingCourse.swapPages(trainingId, pageNum1, pageNum2)
    .then(result => {
      setTimeout(resolve, 2000);
      res.redirect('/training/EditTraining/' + trainingId);
    })
    .catch(err => {
      res.redirect('/training/EditTraining/' + trainingId);
      throw err;
    });
});

module.exports = router;
