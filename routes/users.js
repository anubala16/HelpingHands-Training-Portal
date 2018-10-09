var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// To use our User model class for login/logout/registration
const models = require('../models');
const User = models.User;

// Login
router.get('/LoginPage', function(req, res) {
  res.render('LoginPage', { pageTitle: 'Login' });
});

// Register a non-Admin
router.get('/NewUser', function(req, res) {
  res.render('NewUser', { pageTitle: 'Create a New User Account' });
});

// Register an Admin
router.get('/NewAdmin', function(req, res) {
  res.render('RegisterAdmin', { pageTitle: 'Create a New Admin Account' });
});

// Update user information - not actually inpmlemented in the back-end
router.get('/MyProfile', function(req, res) {
  res.render('NewUser', { pageTitle: 'My Profile' });
});

// Forgot Password/Password retrieval page
router.get('/ForgotPassword', function(req, res) {
  res.render('ForgotPassword', { pageTitle: 'Password Retrieval' });
});

/**
 * Allow Admins to Manage users
 * function asks admins to view users based on county location
 * so they can be displayed on the page
 */
router.get('/ManageUsers', function(req, res) {
  res.render('ManageUsers', {
    pageTitle: 'Manage Users',
  });
});

router.post('/ManageUsers', function(req, res) {
  let county = req.body.county;
  let userType = req.body.userType;
  if (
    (county == null || county.length === 0) &&
    (userType == null || userType.length === 0)
  ) {
    req
      .checkBody(county, 'Please choose a filter (either County or User Type)')
      .notEmpty();

    let val_errors = req.validationErrors();
    let errors = Array.from(val_errors);

    res.render('ManageUsers', { errors: errors });
  } else {
    if (county.length > 0) {
      // filter by county - includes 'ALL' (wildcard) county
      User.getUsersByCounty(county)
        .then(users => {
          res.render('DisplayUsers', {
            pageTitle: 'Display Users',
            users,
          });
        })
        .catch(getCountyUsersError => {
          res.status(500).send(getCountyUsersError);
        });
    } else {
      // filter by user type - includes 'ALL' (wildcard) type
      User.getUsers(userType)
        .then(users => {
          res.render('DisplayUsers', {
            pageTitle: 'Display Users',
            users,
          });
        })
        .catch(getCountyUsersError => {
          res.status(500).send(getCountyUsersError);
        });
    }
  }
});

// Register a new admin
router.post('/NewAdmin', function(req, res) {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let userName = req.body.userName;
  let pwHash = req.body.password;
  let pwHash2 = req.body.password2;

  User.validateAdminBasicFields(req)
    .then(errors => {
      // finished basic user validation,
      // ensure username is not taken yet
      User.getUserByUsername(userName)
        .then(user_result => {
          if (user_result != null) {
            // oops username already taken
            errors.push({
              param: 'userName',
              msg: 'Username already taken. Please try another.',
              value: userName,
            });
          }
          if (errors.length > 0) {
            res.render('RegisterAdmin', { errors: errors });
          } else {
            let newAdmin = {
              firstName: firstName,
              lastName: lastName,
              email: email,
              userName: userName,
              pwHash: pwHash,
              userLevel: 4,
            };
            User.createUser(newAdmin)
              .then(adminCreated => {
                // created user!
                req.flash('success_msg', 'Admin user registered.');
                res.redirect('/LandingHome');
              })
              .catch(createAdminDBErrors => {
                // DB Error creating user
                createErrors.push({
                  param: 'userName',
                  msg: 'DB Error creating admin in database',
                  value: userName,
                });
                res.render('RegisterAdmin', {
                  createAdminDBErrors: createAdminDBErrors,
                });
              });
          }
        })
        .catch(checkUserNameError => {
          // DB Error checking username
          errors.push({
            param: 'userName',
            msg: 'DB Error checking if admin is already in database',
            value: userName,
          });
          res.render('RegisterAdmin', { errors: errors });
        });
    })
    .catch(validateAdminBasicFieldsError => {
      // error validating basic fields
      errors.push({
        param: 'userName',
        msg: 'Error validating basic fields',
        value: userName,
      });
      res.render('RegisterAdmin', { errors: errors });
    });
});

//Register/Update a new non-admin user
router.post('/NewUser', function(req, res) {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let userName = req.body.userName;
  let pwHash = req.body.password;
  let pwHash2 = req.body.password2;
  let phone = req.body.phone;
  let address = req.body.streetAddress;
  let state = req.body.state;
  let zipcode = req.body.zipCode;
  let city = req.body.city;
  let county = req.body.county;

  let company = req.body.employmentCompany;
  let supervisor = req.body.supervisor;
  let userType = req.body.userType;
  // String to represent whether we are creating or updating user
  let action = req.body.action;
  if (action === 'Update My Account') {
    // updating user
    User.getUserByUsername(userName)
      .then(user_result => {
        User.validateBasicFields(req)
          .then(errors => {
            User.getUserLevel(
              // get user level based on type, validate as needed
              userType,
              supervisor.trim(),
              company.trim(),
              errors
            )
              .then(userTypeResult => {
                // finished validating!
                let updatedUser = {
                  userName: user_result.userName,
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  pwHash: pwHash,
                  phone: phone,
                  streetAddr: address,
                  city: city,
                  county: county,
                  state: state,
                  zipcode: zipcode,
                  company: company,
                  supervisor: supervisor,
                  userLevel: userTypeResult,
                };
                User.updateUser(updatedUser)
                  .then(result => {
                    // updated user!
                    req.flash(
                      'success_msg',
                      'Your information has been updated.'
                    );
                    res.redirect('/LandingHome');
                  })
                  .catch(updateError => {
                    // DB Error creating user
                    errors.push({
                      msg: 'DB Error updating user in database',
                    });
                    res.render('NewUser', {
                      errors: errors,
                    });
                  });
              })
              .catch(error => {
                // getUserLevel() errors
                res.render('NewUser', {
                  errors: errors,
                });
              });
          })
          .catch(updateValidationError => {
            errors.push({
              msg: 'Error Validating Inputs',
            });
            res.render('NewUser', { errors: errors });
          });
      })
      .catch(getUserError => {
        // unreachable code?
        res.status(500).send(getUserError);
      });
  } else {
    // creating user
    User.validateBasicFields(req)
      .then(errors => {
        // ensure username is not taken yet
        User.getUserByUsername(userName)
          .then(user_result => {
            if (user_result) {
              // oops username already taken, please try again
              errors.push({
                msg: 'Username already taken. Please try another.',
              });
            }
            User.getUserLevel(
              // get user level based on type, validate as needed
              userType,
              supervisor.trim(),
              company.trim(),
              errors
            )
              .then(userTypeResult => {
                // finished validating!
                let newUser = {
                  firstName: firstName,
                  lastName: lastName,
                  email: email,
                  userName: userName,
                  pwHash: pwHash,
                  phone: phone,
                  streetAddr: address,
                  city: city,
                  county: county,
                  state: state,
                  zipcode: zipcode,
                  company: company,
                  supervisor: supervisor,
                  userLevel: userTypeResult,
                };
                User.createUser(newUser)
                  .then(result => {
                    // created user!
                    req.flash('success_msg', 'You are registered.');
                    res.redirect('/users/LoginPage');
                  })
                  .catch(createError => {
                    // DB Error creating user
                    errors.push({
                      msg: createError,
                    });
                    res.render('NewUser', {
                      errors: errors,
                    });
                  });
              })
              .catch(error => {
                // getUserLevel() errors
                res.render('NewUser', {
                  errors: errors,
                });
              });
          })
          .catch(error => {
            // DB Error retrieving an existing user
            errors.push({
              msg: 'DB Error retrieving user from database',
            });
            res.render('NewUser', { errors: errors });
          });
      })
      .catch(error => {
        // error validating basic fields
        let errors = {
          msg: 'Error validating basic fields',
        };
        res.render('NewUser', { errors: errors });
      });
  }
});

passport.use(
  new LocalStrategy((userName, password, done) => {
    User.getUserByUsername(userName)
      .then(user_result => {
        if (!user_result) throw new Error('No such user found');
        User.comparePassword(password, user_result.pwHash).then(
          passwordIsValid => {
            if (passwordIsValid) {
              return done(null, user_result);
            }
            return done(null, null, {
              message: 'Invalid password, please try again.',
            });
          }
        );
      })
      .catch(err => {
        return done(null, null, { message: err.message });
      });
  })
);

// Serialize and Deserialize User
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id)
    .then(user_result => {
      if (!user_result) throw new Error('No such user found');
      done(null, user_result);
    })
    .catch(err => {
      done(err, null);
    });
});

// Passport Authenticate
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/LoginPage',
    failureFlash: true,
  }),
  function(req, res) {
    res.redirect('/');
  }
);

// logout
router.get('/logout', function(req, res) {
  req.logout();

  req.flash('success_msg', 'You have logged out.');

  res.redirect('/users/LoginPage');
});

module.exports = router;
