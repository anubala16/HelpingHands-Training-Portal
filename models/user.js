'use strict';

// For user passwords
const bcrypt = require('bcryptjs');
var sqlize = require('sequelize');
const Op = sqlize.Op;

/**
 * User Schema for the database
 * Includes all the fields, their sequelize types, and
 * additional constraints (primary key, auto-increment for ID, not null,..)
 *
 * Fields: ID (auto-assigned), userName (unique), first and last names, email,
 * hashed password, phone, address, city, county, state, zipcode, and employment info:
 * (company and supervisor username)
 *
 * User level: default is 1 (regular/other user) or
 * choose among: employee = 2, employer = 3, admin = 4
 */

module.exports = function(dbConn, Sequelize) {
  var User = dbConn.define('User', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    userName: {
      type: Sequelize.STRING,
      unique: true,
    },
    firstName: {
      type: Sequelize.STRING,
    },
    lastName: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    pwHash: {
      type: Sequelize.STRING(64).BINARY,
    },
    phone: {
      type: Sequelize.STRING,
    },
    streetAddr: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    county: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    zipcode: {
      type: Sequelize.STRING,
    },
    company: {
      type: Sequelize.STRING,
    },
    supervisor: {
      type: Sequelize.STRING,
    },
    userLevel: {
      // Other user = 1 (default), employee = 2, employer = 3, admin = 4
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
  });

  /**
   * Must be called before creating users
   * Continues validating the incoming request for user registration.
   * Specifically, checks for the following:
   * If Employee user type:
   *    1) Non-empty supervisor username
   *    2) Known supervisor (supervisor already exists in db)
   *    3) Errors so far
   * If Employer user type:
   *    1) Non-empty Place of Employment (aka company)
   *    2) Errors so far
   * If OtherUser user type:
   *    1) Errors so far
   *
   * @param userType string representing user type user chose during registration
   * @param company place of employment for an employer user
   * @param supervisor supervisor username for employee user (must already exist in db)
   * @param errors array of validation errors so far, will be updated as appropriate
   * @return resolved promise with user level (integer) if no errors fulfilling request
   * @throws rejected promise with all the validation errors to be rendered by caller
   */
  User.getUserLevel = function(userType, supervisor, company, errors) {
    return new Promise(function(resolve, reject) {
      /** NC Collab doesn't want Supervisor for employees *
      if (userType === 'Employee') {
        if (supervisor.length === 0) {
          errors.push({
            param: 'Supervisor',
            msg: 'Supervisor username is required',
            value: supervisor,
          });
          reject(errors);
        } else {
          // Given supervisor should exist in database already
          User.getUserByUsername(supervisor)
            .then(supervisor => {
              if (!supervisor) {
                errors.push({
                  param: 'Supervisor',
                  msg: 'Unknown supervisor. Please register Supervisor first.',
                  value: supervisor,
                });
                reject(errors);
              } else {
                // supervisor exists in db
                if (errors.length >= 1) {
                  // found few errors before, but valid supervisor
                  reject(errors);
                } else resolve(2); // valid employee registration, return employee user level
              }
            })
            .catch(err => {
              reject(new Error('Error retrieving supervisor from database'));
            });
        }
      } else if (userType === 'Employer') {
      */
      if (userType === 'Employer' || userType === 'Employee') {
        if (company.length === 0) {
          errors.push({
            param: 'company',
            msg: 'Place of Employment is required for chosen user type',
            value: company,
          });
          if (errors.length >= 1) reject(errors);
          else reject(errors);
        } else {
          // validate company as necessary...
          if (errors.length >= 1) {
            // valid place of employment provided, but there are errors from other fields
            reject(errors);
          } else {
            if (userType === 'Employer')
              resolve(3); // valid employer registration, return employer user level
            else resolve(2); // valid employee registration, return employee user level
          }
        }
      } else if (userType === 'Admin') {
        if (errors.length >= 1)
          reject(errors); // errors from before
        else resolve(4); // valid admin user registration, return admin level
      } else {
        // userType === OtherUser || FamilyUser
        if (errors.length >= 1)
          reject(errors); // errors from before
        else resolve(1); // valid family user registration, return family user level
      }
    });
  };

  /**
   * Validates the phone number in the given request
   * @param req request with user input to be validated
   * @return a resolved promise when done
   * if phone number is not null in the given request,
   * it is validated using few regular expressions.
   * Acceptable formats:
   *    1) ###-###-####
   *    2) ##########
   * promise is resolved even if phone number is not provided
   */
  User.validatePhone = function(req, errors) {
    return new Promise(function(resolve, reject) {
      if (req.body.phone) {
        let numRegEx = /^d{10}$/;
        let numHyphenRegEx = /^\(?([0-9]{3})\)?[-]?([0-9]{3})[-]?([0-9]{4})$/;
        if (
          !req.body.phone.match(numRegEx) &&
          !req.body.phone.match(numHyphenRegEx)
        ) {
          resolve(errors.push({ msg: 'Phone number is invalid' }));
        } else resolve('valid phone number');
      } else resolve('blank phone number');
    });
  };

  /**
   * Validates the zip code in the given request
   * @param req request with user input to be validated
   * @return a resolved promise when done
   * if zip code is not null in the given request,
   * it is validated to meet the following criteria:
   *    1) Length is 5 characters
   *    2) Contains only numbers
   * promise is resolved even if zip code is not provided
   */
  User.validateZipCode = function(req, errors) {
    return new Promise(function(resolve, reject) {
      if (req.body.zipCode) {
        if (req.body.zipCode.length !== 5 || isNaN(req.body.zipCode.trim())) {
          resolve(errors.push({ msg: 'Enter 5-digit zipcode' }));
        } else resolve('good zip code');
      } else resolve('blank zip code');
    });
  };

  /**
   * Validates the email in the given request
   * @param req request with user input to be validated
   * @return a resolved promise when done
   * if email is not null in the given request,
   * it is validated using express validator (isEmail() function)
   * promise is resolved even if email is not provided
   */
  User.validateEmail = function(req, errors) {
    return new Promise(function(resolve, reject) {
      if (req.body.email) {
        let emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!req.body.email.match(emailRegEx)) {
          resolve(errors.push({ msg: 'Email address is invalid' }));
        } else resolve('valid email');
      } else resolve('blank email provided');
    });
  };

  /**
   * Validates the retyped password in the given request
   * @param req request with user input to be validated
   * @return a resolved promise when done
   * if hashed retyped password is not null in the given request,
   * it is compared with the hashed original password
   * promise is resolved even if hashed retyped password is not provided
   */
  User.validatePassword2 = function(req, errors) {
    return new Promise(function(resolve, reject) {
      if (req.body.password.trim() != req.body.password2.trim()) {
        if (!req.body.password2)
          resolve(errors.push({ msg: 'Please confirm password' }));
        else resolve(errors.push({ msg: 'Passwords do not match' }));
      } else resolve('pwds match'); // pwd2 exists and matches with password
    });
  };

  /**
   * Ensures the given fields are not blank in the given request
   * @param req request with user input to be validated
   * @param field field to be checked in the given request's body
   * @return a resolved promise when done checking for not empty
   */
  User.checkNotEmpty = function(req, errors, field) {
    return new Promise(function(resolve, reject) {
      if (field === 'firstName' && !req.body.firstName.trim()) {
        resolve(errors.push({ msg: 'Please enter your first name' }));
      } else if (field === 'lastName' && !req.body.lastName.trim())
        resolve(errors.push({ msg: 'Please enter your last name' }));
      else if (field === 'userName' && !req.body.userName.trim())
        resolve(errors.push({ msg: 'Please enter an username' }));
      else if (field === 'userType' && !req.body.userType.trim()) {
        resolve(
          errors.push({
            msg: 'Please choose your best user type from the list below',
          })
        );
      } else if (field === 'password' && !req.body.password.trim()) {
        resolve(errors.push({ msg: 'Please enter a password' }));
      } else if (field === 'county' && !req.body.county.trim()) {
        resolve(errors.push({ msg: 'Please choose your county of residence' }));
      } else if (field === 'email' && !req.body.email.trim()) {
        resolve(errors.push({ msg: 'Please enter an email' }));
      } else resolve();
    });
  };

  /**
   * Validates all the basic fields during user registration
   * @param req request with all the user filled-in fields (to be validated)
   * @return resolved promise with all the errors or none if req is valid
   * or rejected promise if there's an error validating
   */
  User.validateBasicFields = function(req) {
    return new Promise(function(resolve, reject) {
      let notEmptyFields = [
        'firstName',
        'lastName',
        'email',
        'userName',
        'password',
        'userType',
        'county',
      ];

      let errors = [];
      let promises = notEmptyFields.map(field =>
        User.checkNotEmpty(req, errors, field)
      );

      let moreValidationPromises = [
        User.validatePhone(req, errors),
        User.validateZipCode(req, errors),
        User.validateEmail(req, errors),
        User.validatePassword2(req, errors),
      ];

      return Promise.all([...promises, ...moreValidationPromises])
        .then(() => {
          resolve(errors);
        })
        .catch(error => reject(error));
    });
  };

  /**
   * Validates all the basic fields during user registration
   * @param req request with all the user filled-in fields (to be validated)
   * @return resolved promise with all the errors or none if req is valid
   * or rejected promise if there's an error validating
   */
  User.validateAdminBasicFields = function(req) {
    return new Promise(function(resolve, reject) {
      let notEmptyFields = [
        'firstName',
        'lastName',
        'email',
        'userName',
        'password',
      ];

      let errors = [];
      let promises = notEmptyFields.map(field =>
        User.checkNotEmpty(req, errors, field)
      );

      let moreValidationPromises = [
        User.validatePhone(req, errors),
        User.validateZipCode(req, errors),
        User.validateEmail(req, errors),
        User.validatePassword2(req, errors),
      ];

      return Promise.all([...promises, ...moreValidationPromises])
        .then(() => {
          resolve(errors);
        })
        .catch(error => reject(error));
    });
  };

  /**
   * Inserts the given user instance in the database;
   * assumes userLevel is a valid integer - use getUserLevel()
   * @param newUser object with User schema fields defined above
   * @return resolved promise with the created user based on the given user
   * @throws rejected promise with a user creation error.
   */
  User.createUser = function(newUser) {
    return new Promise(function(resolve, reject) {
      let hash = bcrypt.hashSync(newUser.pwHash, 10);
      if (
        newUser.userLevel &&
        newUser.userLevel != 1 &&
        newUser.userLevel != 2 &&
        newUser.userLevel != 3 &&
        newUser.userLevel != 4
      ) {
        reject(new Error('Invalid user level specified'));
      } else {
        // valid user level for user
        debugger;
        // user doesn't exist yet - we'll create one :)
        User.create({
          userName: newUser.userName,
          email: newUser.email,
          pwHash: hash,
          firstName: newUser.firstName,
          lastName: newUser.lastName,

          phone: newUser.phone,
          streetAddr: newUser.streetAddr,
          city: newUser.city,
          county: newUser.county,
          state: newUser.state,
          zipcode: newUser.zipcode,

          company: newUser.company,
          supervisor: newUser.supervisor,

          userLevel: newUser.userLevel,
        })
          .then(createdUser => {
            resolve(createdUser);
          })
          .catch(err => {
            reject(new Error('DB Error creating user'));
          });
      }
    });
  };

  /**
   * Receives a VALIDATED User
   * Updates the given user instance in the database;
   * assumes userLevel is a valid integer - use getUserLevel()
   * @param updatedUser validated object with User schema fields defined above
   * @return resolved promise with value: <Array<affectedCount>> - either [[0]] or [[1]]
   * refer Sequelize docs on Model.update()
   * @throws rejected promise with a user creation error.
   */
  User.updateUser = function(updatedUser) {
    return new Promise(function(resolve, reject) {
      let hash = bcrypt.hashSync(updatedUser.pwHash, 10);
      User.update(
        {
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          pwHash: hash,

          phone: updatedUser.phone,
          streetAddr: updatedUser.streetAddr,
          city: updatedUser.city,
          county: updatedUser.county,
          state: updatedUser.state,
          zipcode: updatedUser.zipcode,

          company: updatedUser.company,
          supervisor: updatedUser.supervisor,

          userLevel: updatedUser.userLevel,
        },
        { where: { userName: updatedUser.userName } }
      )
        .then(updateArray => {
          // returns <Array<affectedCount>> = [[0]]/[[1]] (read Sequelize docs)
          resolve(updateArray);
        })
        .catch(err => {
          reject(new Error('DB Error updating user'));
        });
    });
  };

  /**
   * Removes the user with the given username from the database
   * @param username user with this userName will be removed
   * @return resolved promise with a success message upon completion (even if no such user exists)
   * @throws rejected promise with an appropriate error message
   */
  User.removeUser = function(username) {
    return new Promise(function(resolve, reject) {
      User.getUserByUsername(username)
        .then(result => {
          if (!result) {
            resolve('Success');
          } else {
            result
              .destroy()
              .then(() => {
                resolve('Success!');
              })
              .catch(err => {
                reject('DB Error deleting existing user:', username);
              });
          }
        })
        .catch(err => {
          reject('DB Error retrieving user from database');
        });
    });
  };

  /**
   * Used for testing only
   * Removes the users with provided usernames from the database (let users be a string array)
   * Uses removeUser() helper function
   * @param users array of usernames (array of strings) of users to be removed from the database
   * @return resolved promise with success message if all the users were successfully removed from the database
   * @throws rejected promise with an Error message about deleting the given users from database.
   */
  User.removeUsers = function(usernames) {
    return new Promise(function(resolve, reject) {
      Promise.all(usernames.map(User.removeUser))
        .then(() => {
          console.log('removed users!');
          resolve('Success');
        })
        .catch(err => {
          reject('Error removing all users (DB connection error)');
        });
    });
  };

  /**
   * Retrieves User with the given username from the database
   * @param username username of the user to retrieve from the database
   * @return resolved promise with the user having the given username or null if user doesn't exist
   * @throws rejected promise with error if a database access or other error occurs during retrieval
   */
  User.getUserByUsername = function(username) {
    return new Promise(function(resolve, reject) {
      User.findOne({
        where: {
          userName: username,
        },
      })
        .then(user => {
          resolve(user);
        })
        .catch(err => {
          reject(new Error('DB Error retrieving user: ', username));
        });
    });
  };

  /**
   * Retrieves User with the given ID from the database
   * @param id id of the user to retrieve from the database
   * @return resolved promise with the user having the given ID or null if user doesn't exist
   * @throws rejected promise with error if a database access or other error occurs during retrieval
   */
  User.getUserById = function(id) {
    return new Promise(function(resolve, reject) {
      User.findOne({
        where: {
          id: id,
        },
      })
        .then(user => {
          resolve(user); // either null or user
        })
        .catch(err => {
          reject(
            new Error('Error retrieving user by ID (DB connection error)')
          );
        });
    });
  };

  // private method
  /**
   * Gives the type of user (integer) when given the type as a string
   * @param
   * @return
   */
  User.getType = function(typeString) {
    return new Promise(function(resolve, reject) {
      if (typeString === 'FamilyUser' || typeString === 'OtherUser') {
        resolve(1); // family user type
      } else if (typeString === 'Employee') {
        resolve(2); // employee user
      } else if (typeString === 'Employer') {
        resolve(3); // employer user type
      } else if (typeString === 'Admin') {
        resolve(4); // admin user type
      } else if (typeString === 'All') {
        resolve(0); // all/any user type - wildcard
      } else {
        // bad user type string provided
        resolve(100);
      }
    });
  };

  User.getUsers = function(userTypeString) {
    return new Promise(function(resolve, reject) {
      User.getType(userTypeString).then(userType => {
        if (userType === 1) {
          // get all other/family users
          User.findAll({ where: { userLevel: userType } })
            .then(familyUsers => resolve(familyUsers))
            .catch(getFamilyUsersError => reject(getFamilyUsersError));
        } else if (userType === 2) {
          // get all employee users
          User.findAll({ where: { userLevel: userType } })
            .then(employees => resolve(employees))
            .catch(getEmployeesError => reject(getEmployeesError));
        } else if (userType === 3) {
          // get all employers users
          User.findAll({ where: { userLevel: userType } })
            .then(employers => resolve(employers))
            .catch(getEmployersError => reject(getEmployersError));
        } else if (userType === 4) {
          // get all admin users
          User.findAll({ where: { userLevel: userType } })
            .then(admins => resolve(admins))
            .catch(getAdminsError => reject(getAdminsError));
        } else if (userType === 0) {
          // get all users!
          User.findAll({ order: ['userLevel'] })
            .then(allUsers => resolve(allUsers))
            .catch(getUsersError => reject(getUsersError));
        } else {
          // invalid user type string
          reject(new Error('Invalid user type provided'));
        }
      });
    });
  };

  User.getUsersByCounty = function(filterCounty) {
    return new Promise(function(resolve, reject) {
      if (filterCounty === 'All') {
        User.findAll({
          where: { county: { [Op.ne]: null } },
          order: ['county'],
        })
          .then(users => resolve(users))
          .catch(getUsersError => reject(getUsersError));
      } else {
        User.findAll({ where: { county: filterCounty } })
          .then(users => resolve(users))
          .catch(getUsersError => reject(getUsersError));
      }
    });
  };

  /**
   * Compares the given plain-text, user-entered password with the hashed one from database
   * @param candidatePassword plain-text password
   * @param hash password salt; pre-chosen and provided
   * @return resolved promise with the output from bcrypt.compareSync():
   * true if candidatePassword matches with the hash from database, false otherwise
   */
  User.comparePassword = function(candidatePassword, hash) {
    return new Promise(function(resolve, reject) {
      resolve(bcrypt.compareSync(candidatePassword, hash));
    });
  };

  return User;
};
