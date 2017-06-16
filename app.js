/* --------------------------------------------------------------------------
 *  Modules
 * -------------------------------------------------------------------------- */

var bodyParser      = require('body-parser');
var cors            = require('cors')
var express         = require('express');
var logger          = require('morgan');

var auth            = require('./routes/auth');
var jobs            = require('./routes/jobs');
var inbox           = require('./routes/inbox');
var users           = require('./routes/users');
var projects        = require('./routes/projects');

var app             = express();

/* --------------------------------------------------------------------------
 *  Application
 * -------------------------------------------------------------------------- */

// HTML engine
app.set('view engine', 'jade');

app.use(logger('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/auth', auth);
app.use('/jobs', jobs);
app.use('/inbox', inbox);
app.use('/users', users);
app.use('/projects', projects);

/* --------------------------------------------------------------------------
 *  Functions
 * -------------------------------------------------------------------------- */

app.use(function(req, res, next) {
    // Generate a new 404 Error
    var err = new Error('Not Found');
    err.status = 404;

    next(err);
});

app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render error
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
