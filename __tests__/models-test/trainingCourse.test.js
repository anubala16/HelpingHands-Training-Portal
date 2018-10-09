/**
 * This module tests all the functions in  models/user.js
 */
jest.dontMock('../../models/user');
let bcrypt = require('bcryptjs');

const models = require('../../models');
let Course;
let Page;
let Quiz;

beforeAll(() => {
  return models.DBConnector.sync({ force: false });
});

afterAll(() => {});

/**
 * Clear/set up the database before each test function
 */
beforeEach(() => {
  Course = models.TrainingCourse;
  Page = models.ContentPage;
  Quiz = models.Quiz;
});

/**
 * Clear the database of newly created data after each test function
 */
afterEach(() => {
  // let usernames = ['test_bear', 'test_tom', 'test_jim'];
  //return expect(User.removeUsers(usernames)).resolves.toMatch(/Success/);
});

/**
 * This is a dummy test that tests nothing.
 * Used for easy/quick debugging
 */
test('Dummy test', () => {
  expect.assertions(1);
  return expect('dummy').not.toBeNull();
});

test('Valid Case for createCourse() - simple course', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  return Course.createCourse(course1).then(crs1 => {
    return expect(crs1.estMinutes).toEqual(120);
  });
});

test('Error Case for createCourse() - null name', () => {
  expect.assertions(1);
  let course1 = {
    courseName: null,
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  return Course.createCourse(course1).catch(error => {
    return expect(error).toBeInstanceOf(Error);
  });
});
test('Valid Case for updateCourse() - simple course', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  return Course.createCourse(course1).then(crs1 => {
    crs1.courseName = 'World History';
    return Course.updateCourse(crs1).then(updatedCourse => {
      return expect(updatedCourse.courseDesc).toEqual('Comprehensive version');
    });
  });
});

test('Error Case for updateCourse() - null name', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  return Course.createCourse(course1).then(crs1 => {
    crs1.courseName = null;
    return Course.updateCourse(crs1).catch(error => {
      return expect(error).not.toEqual(
        new Error('Error retrieving course from database')
      );
    });
  });
});

test('Valid Case for getAllCourses() - 2 courses', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let course2 = {
    courseName: 'Religious Studies',
    courseDesc: 'A Brief Introduction',
    estMinutes: 60,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.createCourse(course2).then(crs2 => {
      return Course.getAllCourses().then(courses => {
        return Course.count().then(sqlizeCount => {
          return expect(courses.length).toEqual(sqlizeCount);
        });
      });
    });
  });
});

test('Valid Case for getAllCourses() - No new courses', () => {
  expect.assertions(1);
  return Course.getAllCourses().then(courses => {
    return Course.count().then(sqlizeCount => {
      return expect(courses.length).toEqual(sqlizeCount);
    });
  });
});

test('Valid Case for addPage() - simple case', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.getAllPages(crs1.id).then(pages => {
      if (!pages) {
        page1.pageNumber = 1;
        return Course.addPage(crs1.id, page1).then(addedPage => {
          return expect(addedPage.pageType).toEqual(page1.pageType);
        });
      } else {
        page1.pageNumber = pages.length;
        return Course.addPage(crs1.id, page1).then(addedPage => {
          return expect(addedPage.pageType).toEqual(page1.pageType);
        });
      }
    });
  });
});

test('Error Case for getAllPages() - crsId not yet used', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.getAllPages(crs1.id + 1).catch(error => {
      return expect(error).toEqual(
        new Error('Error retrieving course from database')
      );
    });
  });
});

test('Error case for addPage() - invalid crsId', () => {
  expect.assertions(1);
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };

  return Course.addPage('a', page1).catch(error => {
    return expect(error).toEqual(
      new Error('Created page but error finding course to add page')
    );
  });
});

test('Error case for addPage() - invalid page', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: null,
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).catch(error => {
      return expect(error).toEqual(new Error('Error creating content page'));
    });
  });
});

test('Valid case for swapPages() - simple case', () => {
  expect.assertions(1);

  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.addPage(crs1.id, page2).then(result2 => {
        return Course.swapPages(crs1.id, 1, 2).then(successMsg => {
          return expect(successMsg).not.toBeInstanceOf(Error);
        });
      });
    });
  });
});

test('Error case for swapPages() - page 2 does not exist', () => {
  expect.assertions(1);

  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.swapPages(crs1.id, 1, 2).then(invalidPgNumMsg => {
        return expect(invalidPgNumMsg).toEqual('invalid page num');
      });
    });
  });
});

test('Error case for swapPages() - invalid crsId', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.addPage(crs1.id, page2).then(result2 => {
        return Course.swapPages('a', 1, 2).catch(error => {
          return expect(error).toEqual(
            new Error('Error retrieving pages for course')
          );
        });
      });
    });
  });
});

test('Valid Case for deletePage() - delete page 1 of 2', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.addPage(crs1.id, page2).then(result2 => {
        return Page.findOne({
          where: {
            trainingId: crs1.id,
            pageNumber: 1,
          },
        }).then(page => {
          return Quiz.createQuiz(page.id, 85).then(newQuiz => {
            return Quiz.addQuestionToQuiz(newQuiz.id, q1).then(addedQ1 => {
              return Course.deletePage(crs1.id, page.pageNumber).then(
                finalResult => {
                  return expect(finalResult).toEqual('done');
                }
              );
            });
          });
        });
      });
    });
  });
});

test('Valid Case for deletePage() - delete page 2 of 2', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.addPage(crs1.id, page2).then(result2 => {
        return Page.findOne({
          where: {
            trainingId: crs1.id,
            pageNumber: 2,
          },
        }).then(page => {
          return Quiz.createQuiz(page.id, 85).then(newQuiz => {
            return Quiz.addQuestionToQuiz(newQuiz.id, q1).then(addedQ1 => {
              return Course.deletePage(crs1.id, page.pageNumber).then(
                finalResult => {
                  return expect(finalResult).toEqual('done');
                }
              );
            });
          });
        });
      });
    });
  });
});

test('Valid Case for deletePage() - delete page 3 of 2', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.addPage(crs1.id, page2).then(result2 => {
        return Page.findOne({
          where: {
            trainingId: crs1.id,
            pageNumber: 1,
          },
        }).then(page => {
          return Quiz.createQuiz(page.id, 85).then(newQuiz => {
            return Quiz.addQuestionToQuiz(newQuiz.id, q1).then(addedQ1 => {
              return Course.deletePage(crs1.id, 3).then(finalResult => {
                return expect(finalResult).toEqual('page does not exist');
              });
            });
          });
        });
      });
    });
  });
});

test('Valid Case for deleteCourse() - delete 2-page course', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page1).then(result => {
      return Course.addPage(crs1.id, page2).then(result2 => {
        return Page.findOne({
          where: {
            trainingId: crs1.id,
            pageNumber: 1,
          },
        }).then(page => {
          return Quiz.createQuiz(page.id, 85).then(newQuiz => {
            return Quiz.addQuestionToQuiz(newQuiz.id, q1).then(addedQ1 => {
              return Course.deleteCourse(crs1.id).then(finalResult => {
                return expect(finalResult).toEqual('deleted course');
              });
            });
          });
        });
      });
    });
  });
});

test('Valid Case for deleteCourse() - delete 0-page course', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.deleteCourse(crs1.id).then(finalResult => {
      return expect(finalResult).toEqual('deleted course');
    });
  });
});

test('Valid Case for deleteCourse() - delete page 1 of 2', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.deleteCourse(crs1.id + 1).then(finalResult => {
      return expect(finalResult).toEqual('course does not exist');
    });
  });
});

test('Valid Case for getPagesInOrder() - 2-page course', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page2).then(result2 => {
      return Course.addPage(crs1.id, page1).then(result => {
        return Course.getPagesInOrder(crs1.id).then(pages => {
          return expect(pages[0].pageType).toEqual('Quiz');
        });
      });
    });
  });
});

test('Valid Case for updatePage()', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page2).then(result2 => {
      return Course.updatePage(crs1.id, result2).then(result => {
        return expect(result.pageType).toEqual('Timeline');
      });
    });
  });
});

test('Error Case for updatePage() - page does not exist yet', () => {
  expect.assertions(1);
  let course1 = {
    courseName: 'Earth History',
    courseDesc: 'Comprehensive version',
    estMinutes: 120,
  };
  let page1 = {
    id: 'a',
    pageType: 'Quiz',
    pageDesc: 'Quick Pre-test',
    pageNumber: 1,
    contentJSON: null,
  };
  let page2 = {
    pageType: 'Timeline',
    pageDesc: 'First One',
    pageNumber: 2,
    contentJSON: null,
  };
  let q1 = {
    points: 2,
    questionType: 'True-False',
    questionText: 'Earth is round',
    choiceA: 'True',
    choiceB: 'False',
    correctChoice: 'A',
  };
  return Course.createCourse(course1).then(crs1 => {
    return Course.addPage(crs1.id, page2).then(result2 => {
      return Course.updatePage(crs1.id, page1).catch(error => {
        return expect(error).toEqual(new Error('cannot find page to update'));
      });
    });
  });
});
