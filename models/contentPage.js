'use strict';

/**
 * ContentPage Table Schema for the database
 * Includes all the fields, their sequelize types, and
 * additional constraints (primary key, auto-increment for ID, not null,..)
 *
 * Fields:
 * id: type - integer, auto-assigned, auto-incremented
 * pageType: type - string, not empty, valid values: 'Quiz'/'Timeline'/'Lesson'
 *                                                   (or 'quix'/'timeline'/'lesson')
 * pageDesc: type - string, page title/description for admins
 * pageNumber: type - integer, not empty, default value: last page number in course
 * contentJSON: type - JSON, body of the page provided by admin and shown to user
 */

module.exports = function(dbConn, Sequelize) {
  const ContentPage = dbConn.define('ContentPage', {
    id: {
      //unique id for the content page
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    pageType: {
      // Type of content page
      // Quiz, or Lesson, or Timeline
      type: Sequelize.STRING,
      allowNull: false,
    },
    pageDesc: {
      //description of page (for admins)
      type: Sequelize.STRING,
    },
    pageNumber: {
      //which page of the course this page is
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    },
    contentJSON: {
      //a JSON containing the page content
      type: Sequelize.JSON,
    },
  });

  /**
   * Creates a new contentPage and saves it to the database
   * @param newContentPage new contentPage to be added to database
   * @return resolved Promise with the newly created contentPage (including its ID) in database or
   * a rejected Promise with error message if there's an error performing the function
   */
  ContentPage.createContentPage = function(newContentPage) {
    return new Promise(function(resolve, reject) {
      ContentPage.create({
        pageType: newContentPage.pageType,
        pageDesc: newContentPage.pageDesc,
        pageNumber: newContentPage.pageNumber,
        contentJSON: newContentPage.contentJSON,
      })
        .then(newContentPage => {
          resolve(newContentPage);
        })
        .catch(createContentPageError => {
          reject(createContentPageError); // error creating content page
        });
    });
  };

  return ContentPage;
};
