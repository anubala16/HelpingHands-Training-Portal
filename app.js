let express = require('express');

let path = require('path');
let bodyParser = require('body-parser');
let exphbs = require('express-handlebars');
let expressValidator = require('express-validator');
let cookieParser = require('cookie-parser');
let flash = require('connect-flash');
let session = require('express-session');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let dbconn = require('./DBConnector');
let mysql = require('mysql');

// import routes ("controllers")
let routes = require('./routes/index');
let users = require('./routes/users');
let training = require('./routes/training');

// Initialize App
let app = express();

// Set up View Engine
// Use Folder views to set up Views
app.set('views', path.join(__dirname, 'views'));
// Default file will be called layout.handlebars
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
// Set View Engine to handlebars
app.set('view engine', 'handlebars');
// Set the stylesheet for css
app.get('views/css/style.css', function(req, res) {
  res.send('views/css/style.css');
  res.end();
});

// BodyParser Middleware (Set up code)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Public Folder (Named public)
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Express Validator Middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

// Connect Flash
app.use(flash());

// Global Vars
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Middleware for route/user files
app.use('/', routes);
app.use('/users', users);
app.use('/training', training);

var hbs = exphbs.create({
  helpers: {
    ifEQ: function(a, b, options) {
      if (a === b) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
  },
  defaultLayout: 'layout',
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

module.exports = app;
