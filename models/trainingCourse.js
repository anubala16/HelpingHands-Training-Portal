'use strict';
var sqlize = require('sequelize');
const Op = sqlize.Op;

/**
 * TrainingCourse Schema for the database
 *
 * Includes all the fields, their sequelize types, and
 * additional constraints (primary key, auto-increment for ID, not null,..)
 *
 * Fields:
 * id: type - integer, unique, auto-assigned, auto-incremented
 * courseName: type - string, not-empty, brief name for the course
 * courseDesc: type - text, brief description for the course
 * estMinutes: type - integer, estimated minutes to complete the course
 */
module.exports = function(dbConn, Sequelize) {
  var ContentPage;
  var Quiz;
  const TrainingCourse = dbConn.define('TrainingCourse', {
    id: {
      //unique id for the training course
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    courseName: {
      // the name of the training course
      type: Sequelize.STRING,
      allowNull: false,
    },
    courseDesc: {
      //description of the training course
      type: Sequelize.TEXT,
    },
    estMinutes: {
      //estimated time (in minutes) required to complete
      type: Sequelize.INTEGER.UNSIGNED,
    },
  });

  /**
   * Defines associations pertaining to this class
   * @param models has reference to all our model classes/object
   */
  TrainingCourse.associate = function(models) {
    ContentPage = models.ContentPage;
    Quiz = models.Quiz;

    /**
     * Defining a one-to-many relationship between training course and content pages
     * ContentPage table gets a trainingId foreign key (renamed from default trainingCourseID)
     * TrainingCourse gets getPages() and setPages() as well
     */
    TrainingCourse.hasMany(models.ContentPage, {
      as: {
        singular: 'page',
        plural: 'pages',
      },
      foreignKey: 'trainingId',
      sourceKey: 'id',
      onDelete: 'cascade',
    });
  };

  /**
   * Retrieves course from the database with the given ID
   * @param crsId course with this ID will be retrieved and returned
   * @return resolved Promise with the course with the given Id
   * or rejected Promise with error if there's an error performing the function
   */
  TrainingCourse.getCourseById = function(crsId) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.findOne({
        where: {
          id: crsId,
        },
      })
        .then(course => {
          resolve(course); // either null or course
        })
        .catch(err => {
          // unreachable code?
          reject(err); // error retieving course
        });
    });
  };

  /**
   * Get all method for training courses
   * @return resolved Promise with array of training courses currently in database
   * or rejected Promise with error if there's an error performing the function
   */
  TrainingCourse.getAllCourses = function() {
    return new Promise(function(resolve, reject) {
      TrainingCourse.findAll()
        .then(courses => {
          resolve(courses);
        })
        .catch(err => {
          reject(new Error('Error retrieving courses'));
        });
    });
  };

  /**
   * Creates a new course based on the given one and adds it to the database
   * @param newCourse new Course to be created and added to the database
   * @return a resolved Promise with the newly created course
   * or rejected Promise with error if there's an error performing the function
   */
  TrainingCourse.createCourse = function(newCourse) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.create({
        courseName: newCourse.courseName,
        courseDesc: newCourse.courseDesc,
        estMinutes: newCourse.estMinutes,
      })
        .then(createdCourse => {
          resolve(createdCourse);
        })
        .catch(err => {
          reject(err); // error creating course
        });
    });
  };

  /**
   * Gets all contentPages corresponding to the given course;
   * pages MAY or MAY NOT be sorted!
   * @param crsId id of the course whose pages must be retrieved from database
   * @return resolved Promise with all the course's pages (in an array)
   * or rejected Promise with error if there's an error performing the function
   */
  TrainingCourse.getAllPages = function(crsId) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.getCourseById(crsId)
        .then(course => {
          course
            .getPages()
            .then(pages => {
              resolve(pages);
            })
            .catch(getPagesError => {
              reject(new Error('Error retrieving pages for the course'));
            });
        })
        .catch(courseRetrievalError => {
          reject(new Error('Error retrieving course from database'));
        });
    });
  };

  TrainingCourse.validateReq = function(courseName, estTime, errors) {
    return new Promise(function(resolve, reject) {
      if (!courseName.trim() || isNaN(estTime.trim())) {
        errors.push({
          msg: 'Please enter a name and/or estimated minutes for the course',
        });
        if (errors.length >= 1) reject(errors);
        else resolve('valid request');
      } else {
        resolve('valid request');
      }
    });
  };

  /**
   * Gets all the pages in course sorted by page numbers
   * @param crsId id oof the course whose pages must be retrieved
   * @return Promise - resolved with pages of the course sorted (or) rejected if some error occurs
   */
  TrainingCourse.getPagesInOrder = function(crsId) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.getAllPages(crsId)
        .then(pages => {
          var sorted = pages.sort(function(page1, page2) {
            return page1.pageNumber - page2.pageNumber;
          });
          resolve(sorted);
        })
        .catch(err => reject(err));
    });
  };

  /**
   * Adds the given contentPage to the end of the given course.
   * First, creates and stores the given page in the database and then, adds to the course
   * @param crsId course to be updated to have the new contentPage
   * @param page new ContentPage to be added to the end of the given course
   * @return resolved Promise with the newly added page to the trainingPages junction table
   * or rejected Promise with error if there's an error performing the function
   */
  TrainingCourse.addPage = function(crsId, page) {
    return new Promise(function(resolve, reject) {
      ContentPage.createContentPage(page)
        .then(createdPage => {
          TrainingCourse.getCourseById(crsId)
            .then(course => {
              course
                .addPage(createdPage)
                .then(addedPage => {
                  resolve(createdPage);
                })
                .catch(addPageError => {
                  reject(
                    new Error('DB Error when adding this page. Please retry')
                  );
                });
            })
            .catch(getCourseError => {
              reject(
                new Error('Created page but error finding course to add page')
              );
            });
        })
        .catch(createPageError => {
          reject(new Error('Error creating content page'));
        });
    });
  };

  /**
   * Swaps the given pages in training (by changing page numbers). Handles all corner cases as well
   * @param crsId id of the course whose pages must be swapped
   * @param pageNum1 page number of page 1
   * @param pageNum2 page number of page 2
   * @return Promise - resolved with 'swapped' message once done (or) rejected with error if error
   */
  TrainingCourse.swapPages = function(crsId, pageNum1, pageNum2) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.getAllPages(crsId)
        .then(pages => {
          if (
            pageNum1 >= 1 &&
            pageNum1 <= pages.length &&
            pageNum2 >= 1 &&
            pageNum2 <= pages.length
          ) {
            ContentPage.findOne({
              where: {
                trainingId: crsId,
                pageNumber: pageNum1,
              },
            })
              .then(page1 => {
                ContentPage.findOne({
                  where: {
                    trainingId: crsId,
                    pageNumber: pageNum2,
                  },
                })
                  .then(page2 => {
                    var temp = page1.pageNumber;
                    page1
                      .update({
                        pageNumber: page2.pageNumber,
                      })
                      .then(() => {
                        page2
                          .update({
                            pageNumber: temp,
                          })
                          .catch(updatePageError => {
                            reject(new Error('Error updating page 2'));
                          });
                        resolve('swapped');
                      })
                      .catch(updatePageError => {
                        reject(new Error('Error updating page 1'));
                      });
                  })
                  .catch(findPageError => {
                    reject(new Error('Error finding page 2 in course'));
                  });
              })
              .catch(findPageError => {
                reject(new Error('Error finding page 1 in course'));
              });
          } else {
            resolve('invalid page num');
          }
        })
        .catch(getPagesError => {
          reject(new Error('Error retrieving pages for course'));
        });
    });
  };

  /**
   * Permanently deletes the given page from the database
   * If page is of type Quiz, all the questions are also deleted
   * Updates page numbers of subsequent pages in course
   * Uses 2 helper functions: deleteContentPage() & decrementPageNumber()
   * @param crsId id of the course the page to be deleted belongs
   * @param pageNum page number of the page in given course
   * @return promise - resolved when all the contents of the page are deleted (or) rejected if error during deletion
   */
  TrainingCourse.deletePage = function(crsId, pageNum) {
    return new Promise(function(resolve, reject) {
      ContentPage.findOne({
        where: {
          trainingId: crsId,
          pageNumber: pageNum,
        },
      })
        .then(page => {
          if (!page) {
            resolve('page does not exist');
          } else {
            if (page.pageType === 'Quiz') {
              Quiz.getQuiz(page.id)
                .then(quizToDelete => {
                  Quiz.deleteQuiz(quizToDelete)
                    .then(() => {
                      TrainingCourse.deleteContentPage(crsId, page, pageNum)
                        .then(result => {
                          resolve(result);
                        })
                        .catch(deleteContentPageError => {
                          reject(deleteContentPageError);
                        });
                    })
                    .catch(destroyQuizError => {
                      reject(
                        new Error('Error deleting quiz associated with page')
                      );
                    });
                })
                .catch(getQuizError => {
                  reject(new Error('Error retrieving quiz to delete'));
                });
            } else {
              // timeline page
              TrainingCourse.deleteContentPage(crsId, page, pageNum)
                .then(result => {
                  resolve(result);
                })
                .catch(deleteContentPageError => {
                  reject(deleteContentPageError);
                });
            }
          }
        })
        .catch(getContentPageError => {
          reject(new Error('Error finding the page to be removed'));
        });
    });
  };

  /**
   * Helper function for deletePage()
   * deletes page entry and updates page numbers of subsequent pages
   * @param crsId id of the course the page to be deleted belongs to
   * @param page the page to be deleted
   * @param pageNum pageNumber of the page to be deleted (used to update other pages' numbers)
   * @return Promise - resolved when done (or) rejected if error
   */
  TrainingCourse.deleteContentPage = function(crsId, page, pageNum) {
    return new Promise(function(resolve, reject) {
      page
        .destroy()
        .then(() => {
          ContentPage.findAll({
            where: {
              trainingId: crsId,
              pageNumber: {
                [Op.gt]: pageNum,
              },
            },
          })
            .then(pagesToDecrement => {
              if (pagesToDecrement) {
                let promises = pagesToDecrement.map(curPage =>
                  TrainingCourse.decrementPageNumber(curPage)
                );
                Promise.all([...promises])
                  .then(() => {
                    resolve('done');
                  })
                  .catch(decPageNumbersError => {
                    reject(new Error('Error updating subsequent page numbers'));
                  });
              } else {
                resolve('done');
              }
            })
            .catch(getPagesToDecError => {
              reject(new Error('Error finding pages to update in training'));
            });
        })
        .catch(destroyPageError => {
          reject(new Error('Error deleting page'));
        });
    });
  };

  /**
   * Helper function for deleteContentPage()
   * Decrements the given page's page number to reflect the deleted page in course
   * This is needed when getting all pages in a course and displaying them in order on the front-end
   * @param page the page whose page number must be decremented
   * @return Promise - resolved once page number is decremented (or) rejected if error
   */
  TrainingCourse.decrementPageNumber = function(page) {
    return new Promise(function(resolve, reject) {
      page
        .decrement('pageNumber')
        .then(() => resolve('done'))
        .catch(error => reject(error));
    });
  };

  /**
   * Permanently deletes the course with the given ID from the database
   * Recursively deletes ALL the PAGES in the course as well (as Sequelize doesn't cascade deletion)
   * Uses deletePage() - so if page is of type Quiz, all the questions are also deleted
   * @param crsId id of the course to be deleted
   * @return Promise - resolved with a success message once done (or) rejected if some error occurs
   */
  TrainingCourse.deleteCourse = function(crsId) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.getCourseById(crsId)
        .then(course => {
          if (!course) {
            resolve('course does not exist');
          } else {
            course
              .getPages()
              .then(pages => {
                let promises = pages.map(curPage =>
                  TrainingCourse.deletePage(crsId, curPage.pageNumber)
                );
                Promise.all([...promises])
                  .then(() => {
                    course
                      .destroy()
                      .then(result => {
                        resolve('deleted course');
                      })
                      .catch(deleteCourseError => {
                        reject(deleteCourseError);
                      });
                  })
                  .catch(deletePagesError => {
                    reject(new Error('Error deleting pages in course'));
                  });
              })
              .catch(getPagesError => {
                reject(new Error('Error finding pages pertaining to training'));
              });
          }
        })
        .catch(getCourseError => {
          reject(getCourseError);
        });
    });
  };

  /**
   * Update function for training course
   * Assumes course with same id already exists in database
   * User can update name, description, estimatedMinutes for the course
   * Update is accomplished using the id of the course (don't change this!)
   * @param updatedCourse course object with edited attributes
   * @return Promise - resolved once update is done with value: <Array<affectedCount>> - either [[0]] or [[1]]
   * refer Sequelize docs on Model.update()
   * @throws rejected promise with error if there's an error during update
   */
  TrainingCourse.updateCourse = function(updatedCourse) {
    return new Promise(function(resolve, reject) {
      TrainingCourse.getCourseById(updatedCourse.id)
        .then(course => {
          course
            .update(
              {
                courseName: updatedCourse.courseName,
                courseDesc: updatedCourse.courseDesc,
                estMinutes: updatedCourse.estMinutes,
                updatedAt: dbConn.fn('NOW'),
              },
              {
                where: {
                  id: updatedCourse.id,
                },
              }
            )
            .then(rowsAffected => {
              resolve(updatedCourse);
            })
            .catch(err => {
              reject(err); // error updating course
            });
        })
        .catch(getCourseError => {
          reject(new Error('Error retrieving course from database'));
        });
    });
  };

  /**
   * Page update function
   * Assumes page with same id already exists in database
   * User can edit page type, description, and contentJSON
   * @param crsId id of the course whose page must be updated
   * @param updatedPage edited page object with the updated content
   * @return Promise - resolved with the given updatedPage once done (or) rejected if some error occurs
   */
  TrainingCourse.updatePage = function(crsId, updatedPage) {
    return new Promise(function(resolve, reject) {
      ContentPage.findOne({
        where: {
          id: updatedPage.id,
        },
      })
        .then(page => {
          if (!page) reject(new Error('cannot find page to update'));
          else {
            page
              .update({
                pageType: updatedPage.pageType,
                pageDesc: updatedPage.pageDesc,
                contentJSON: updatedPage.contentJSON,
                updatedAt: dbConn.fn('NOW'),
              })
              .then(rowAffected => {
                resolve(page); // either null or course
              })
              .catch(pageUpdateError => {
                reject(new Error('Error updating page'));
              });
          }
        })
        .catch(findContentPageError => {
          reject(findContentPageError); // error retieving page
        });
    });
  };

  return TrainingCourse;
};
