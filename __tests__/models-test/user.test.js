/**
 * This module tests all the functions in  models/user.js
 */
jest.dontMock('../../models/user');
let bcrypt = require('bcryptjs');

const models = require('../../models');
let User;

beforeAll(() => {
  return models.DBConnector.sync();
});

/**
 * Clear/set up the database before each test function
 */
beforeEach(() => {
  let usernames = ['test_bear', 'test_tom', 'test_jim', 'test_employee'];
  User = models.User;
  return expect(User.removeUsers(usernames)).resolves.toMatch(/Success/);
});

/**
 * Clear the database of newly created data after each test function
 */
afterEach(() => {
  let usernames = [];
  // let usernames = ['test_bear', 'test_tom', 'test_jim'];
  return expect(User.removeUsers(usernames)).resolves.toMatch(/Success/);
});

/**
 * This is a dummy test that tests nothing.
 * Used for easy/quick debugging
 */
test('Dummy test', () => {
  expect.assertions(3);
  return expect('dummy').not.toBeNull();
});

/**
 * Valid case for User.createUser() - simple user
 */
test('Valid case for createUser() - creates a simple user (new username)', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return expect(result.firstName).toEqual(newUser.firstName);
  });
});

test('Valid case for createUser() - create an admin user', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Tom',
    lastName: 'Sawyer',
    email: 'tom@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'tom',
    phone: '111-111-1111',
    streetAddr: '111 Paradise Place',
    city: 'Cary',
    county: 'Wake',
    state: 'NC',
    zipcode: '27695',
    company: 'Twain Fun',
    supervisor: 'Mark_Twain',
    userLevel: 4,
  };
  return User.createUser(newUser).then(result => {
    return expect(result.firstName).toEqual(newUser.firstName);
  });
});

/**
 * Error case for User.createUser()
 * Attempts to create another user with an already taken username
 */
test('Error case for createUser() - creating an user with an already taken username', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'tom',
    lastName: 'sawyer',
    email: 'tom@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'tom',
    userLevel: 1,
  };
  let newUser2 = {
    firstName: 'test',
    email: 'test@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'test',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(newUser2).catch(err => {
      return expect(err).toEqual(new Error('DB Error creating user'));
    });
  });
});

/**
 * Error case for User.createUser()
 * Attempts to create user of invalid type/level
 */
test('Error case for createUser() - invalid user level (letter)', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Tom',
    lastName: 'Sawyer',
    email: 'tom@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'tom',
    phone: '111-111-1111',
    streetAddr: '111 Paradise Place',
    city: 'Cary',
    county: 'Wake',
    state: 'NC',
    zipcode: '27695',
    company: 'Twain Fun',
    supervisor: 'Mark_Twain',
    userLevel: 'a',
  };
  return User.createUser(newUser).catch(err => {
    // Want to get here
    return expect(err).toEqual(new Error('Invalid user level specified'));
  });
});

/**
 * Error case for User.createUser()
 * Attempts to create user of invalid type/level
 */
test('Error case for createUser() - invalid user level (out-of-range integer)', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Tom',
    lastName: 'Sawyer',
    email: 'tom@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'tom',
    phone: '111-111-1111',
    streetAddr: '111 Paradise Place',
    city: 'Cary',
    county: 'Wake',
    state: 'NC',
    zipcode: '27695',
    company: 'Twain Fun',
    supervisor: 'Mark_Twain',
    userLevel: 5,
  };
  return User.createUser(newUser).catch(err => {
    // Want to get here
    return expect(err).toEqual(new Error('Invalid user level specified'));
  });
});

/**
 * Valid case for User.updateUser() - simple user
 */
test('Valid case for updateUser() - updates an existing user', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    result.firstName = 'Big';
    result.lastName = 'Apple';
    return User.updateUser(result).then(updatedCount => {
      return expect(updatedCount[0]).toEqual(1);
    });
  });
});

/**
 * Valid case for User.updateUser()
 */
test('Valid case for updateUser() - updates a non-existing user', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.updateUser(newUser)
    .then(updatedCount => {
      // should go here
      return expect(updatedCount[0]).toEqual(0); // should fail
    })
    .catch(updateErr => {
      // should not be here - have a failing statement
      return expect(updateErr).toBeNull();
    });
});

/**
 * Error case for User.updateUser()
 * Attempts to update user with invalid type/level value
 */
test('Error case for updateUser() - invalid user level (letter)', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Tom',
    lastName: 'Sawyer',
    email: 'tom@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'tom',
    county: 'Wake',
    company: 'Twain Fun',
    supervisor: 'Mark_Twain',
  };
  return User.createUser(newUser).then(result => {
    result.userLevel = 'a';
    return User.updateUser(result).catch(err => {
      // Want to get here
      return expect(err).toEqual(new Error('DB Error updating user'));
    });
  });
});

/**
 * Valid case for User.validateBasicFields() - simple (all mandatory fields)
 */
test('Valid case for validateBasicFields() - simple (all mandatory fields)', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors.length).toEqual(0);
  });
});

/**
 * Valid case for User.validateBasicFields() - complex (all fields)
 */
test('Valid case for validateBasicFields() - complex (all fields)', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
      phone: '111-111-1111',
      zipCode: '12345',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors.length).toEqual(0);
  });
});

/**
 * Valid case for User.validateAdminBasicFields() - complex (all fields)
 */
test('Valid case for validateAdminBasicFields() - complex (all fields)', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
      phone: '111-111-1111',
      zipCode: '12345',
    },
  };
  return User.validateAdminBasicFields(req).then(errors => {
    return expect(errors.length).toEqual(0);
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing email in incoming request
 */
test('Valid case for validateBasicFields() - missing email', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: '',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Please enter an email');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing first name in incoming request
 */
test('Valid case for validateBasicFields() - missing first name', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: '',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Please enter your first name');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing last name in incoming request
 */
test('Valid case for validateBasicFields() - missing last name', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: '',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Please enter your last name');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing username in incoming request
 */
test('Valid case for validateBasicFields() - missing username', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: '',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Please enter an username');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing password in incoming request
 */
test('Valid case for validateBasicFields() - missing password', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: '',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Please enter a password');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing userType in incoming request
 */
test('Valid case for validateBasicFields() - missing user type', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: '',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual(
      'Please choose your best user type from the list below'
    );
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing county in incoming request
 */
test('Valid case for validateBasicFields() - missing county', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: '',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual(
      'Please choose your county of residence'
    );
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch missing password2 in incoming request
 */
test('Valid case for validateBasicFields() - missing password2', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: '',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Please confirm password');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch invalid email in incoming request
 */
test('Valid case for validateBasicFields() - invalid email', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Email address is invalid');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch invalid phone number in incoming request
 */
test('Valid case for validateBasicFields() - invalid phone', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
      phone: 'abcde',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Phone number is invalid');
  });
});

/**
 * Valid case for User.validateBasicFields()
 * to catch invalid zip in incoming request
 */
test('Valid case for validateBasicFields() - invalid zipcode', () => {
  expect.assertions(3);
  let req = {
    body: {
      firstName: 'Big',
      lastName: 'Bear',
      email: 'bear@gmail.com',
      userName: 'test_bear',
      password: 'bear',
      password2: 'bear',
      userType: 'Employer',
      county: 'Random',
      zipCode: 'abcde',
    },
  };
  return User.validateBasicFields(req).then(errors => {
    return expect(errors[0].msg).toEqual('Enter 5-digit zipcode');
  });
});

test('Valid case for getUserById() - Gets existing user by in-use ID', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.getUserById(result.id).then(user => {
      return expect(result).not.toBeNull();
    });
  });
});

test('Valid case for comparePassword()', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(user => {
    return User.comparePassword('bear', user.pwHash).then(result => {
      return expect(result).toBeTruthy();
    });
  });
});

/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - employers', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  let employer = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'bear',
    userLevel: 3,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(employer).then(result2 => {
      return User.getUsers('Employer').then(employers => {
        return expect(employers.length).toEqual(1);
      });
    });
  });
});

/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - employees', () => {
  expect.assertions(3);
  let employee1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 2,
  };
  let employee2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'bear',
    userLevel: 2,
  };
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(employee1).then(result2 => {
      return User.createUser(employee2).then(result3 => {
        return User.getUsers('Employee').then(employees => {
          return expect(employees.length).toEqual(2);
        });
      });
    });
  });
});

/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - family users', () => {
  expect.assertions(3);
  let employee1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 2,
  };
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(employee1).then(result2 => {
      return User.getUsers('FamilyUser').then(users => {
        return expect(users.length).toEqual(1);
      });
    });
  });
});

/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - other users', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 1,
  };
  let newUser2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(newUser2).then(result2 => {
      return User.getUsers('OtherUser').then(users => {
        return expect(users.length).toEqual(2);
      });
    });
  });
});
/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - no family users', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 2,
  };
  let newUser2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    userLevel: 4,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(newUser2).then(result2 => {
      return User.getUsers('OtherUser').then(users => {
        return expect(users.length).toEqual(0);
      });
    });
  });
});

/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - admins', () => {
  expect.assertions(3);
  let employee1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 2,
  };
  let admin1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'bear',
    userLevel: 4,
  };
  let admin2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    userLevel: 4,
  };
  return User.createUser(admin1).then(result => {
    return User.createUser(employee1).then(result2 => {
      return User.createUser(admin2).then(result3 => {
        return User.getUsers('Admin').then(admins => {
          return expect(admins.length).toEqual(2);
        });
      });
    });
  });
});

/**
 * Valid case for User.getUsers()
 */
test('Valid case for getUsers() - all types', () => {
  expect.assertions(3);
  let employer1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    userLevel: 3,
  };
  let employee1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'bear',
    userLevel: 2,
  };
  let employee2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_employee',
    pwHash: 'bear',
    userLevel: 2,
  };
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(employee1).then(result2 => {
      return User.createUser(employer1).then(result2 => {
        return User.createUser(employee2).then(result3 => {
          return User.getUsers('All').then(allUsers => {
            return expect(allUsers.length).toEqual(4);
          });
        });
      });
    });
  });
});

/**
 * Error case for User.getUsers()
 */
test('Error case for getUsers() - invalid userTypeString', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'tom',
    lastName: 'sawyer',
    email: 'tom@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'tom',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.getUsers('EveryType').catch(err => {
      // Want to get here
      return expect(err).toEqual(new Error('Invalid user type provided'));
    });
  });
});

/**
 * Valid case for User.getUsersByCounty()
 */
test('Valid case for getUsersByCounty() - All Counties', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    county: 'Chatham',
    userLevel: 1,
  };
  let newUser2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    county: 'Mecklenburg',
    userLevel: 1,
  };
  let employee1 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_tom',
    pwHash: 'bear',
    county: 'Chatham',
    userLevel: 2,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(newUser2).then(result2 => {
      return User.createUser(employee1).then(result2 => {
        return User.getUsersByCounty('All').then(users => {
          return expect(users.length).toEqual(3);
        });
      });
    });
  });
});

/**
 * Valid case for User.getUsersByCounty()
 */
test('Valid case for getUsersByCounty() - Caldwell County', () => {
  expect.assertions(3);
  let newUser = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_bear',
    pwHash: 'bear',
    county: 'Caldwell',
    userLevel: 1,
  };
  let newUser2 = {
    firstName: 'Bear',
    email: 'bear@ncsu.edu',
    userName: 'test_jim',
    pwHash: 'bear',
    county: 'Mecklenburg',
    userLevel: 1,
  };
  return User.createUser(newUser).then(result => {
    return User.createUser(newUser2).then(result2 => {
      return User.getUsersByCounty('Caldwell').then(users => {
        return expect(users.length).toEqual(1);
      });
    });
  });
});

/**
 * Valid case for User.getUserLevel()
 */
test('Valid case for getUserLevel() - employee user', () => {
  expect.assertions(3);
  let errors = [];
  return User.getUserLevel('Employee', 'admin', 'Fruit World', errors).then(
    result => {
      return expect(result).toEqual(2);
    }
  );
});

/**
 * Valid case for User.getUserLevel()
 */
test('Valid case for getUserLevel() - employer user', () => {
  expect.assertions(3);
  let errors = [];
  return User.getUserLevel('Employer', 'admin', 'Fruit World', errors).then(
    result => {
      return expect(result).toEqual(3);
    }
  );
});

/**
 * Valid case for User.getUserLevel()
 */
test('Valid case for getUserLevel() - family user', () => {
  expect.assertions(3);
  let errors = [];
  return User.getUserLevel('FamilyUser', 'admin', 'Fruit World', errors).then(
    result => {
      return expect(result).toEqual(1);
    }
  );
});

/**
 * Error case for User.getUserLevel()
 */
test('Error case for getUserLevel() - missing company for employee', () => {
  expect.assertions(3);
  let errors = [];
  return User.getUserLevel('Employee', 'admin', '', errors).catch(error => {
    return expect(error[0].msg).toEqual(
      'Place of Employment is required for chosen user type'
    );
  });
});

/**
 * Error case for User.getUserLevel()
 */
test('Error case for getUserLevel() - missing company for employer', () => {
  expect.assertions(3);
  let errors = [];
  return User.getUserLevel('Employer', 'admin', '', errors).catch(error => {
    return expect(error[0].msg).toEqual(
      'Place of Employment is required for chosen user type'
    );
  });
});

/**
 * Error case for User.getUserLevel()
 */
test('Error case for getUserLevel() - valid input but errors already present', () => {
  expect.assertions(3);
  let errors = [{ msg: 'Missing username' }];
  return User.getUserLevel('Employee', 'admin', 'Fruit World', errors).catch(
    error => {
      return expect(error.length).toBeGreaterThanOrEqual(1);
    }
  );
});

/**
 * Error case for User.getUserLevel()
 */
test('Error case for getUserLevel() - employee missing company and errors already present', () => {
  expect.assertions(3);
  let errors = [{ msg: 'Missing username' }];
  return User.getUserLevel('Employee', 'admin', '', errors).catch(error => {
    return expect(error.length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * Error case for User.getUserLevel()
 */
test('Error case for getUserLevel() - family user missing company and errors already present', () => {
  expect.assertions(3);
  let errors = [{ msg: 'Missing username' }];
  return User.getUserLevel('FamilyUser', 'admin', '', errors).catch(error => {
    return expect(error.length).toBeGreaterThanOrEqual(1);
  });
});
