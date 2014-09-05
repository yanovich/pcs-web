/* app.js -- application setup
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var method_override = require('method-override');
var csrf = require('csurf');
var mongoose = require('mongoose');
var fs = require('fs');
var clientSessions = require("client-sessions");

var devices = require('./routes/device');
var sites = require('./routes/site');
var systems = require('./routes/system');
var users = require('./routes/user');
var sessions = require('./routes/session');
var passwordReset = require('./routes/passwordReset');
var auth = require('./routes/_auth');
var authUser = auth.authenticate;
var states = require('./routes/state');

var config = require('./config');

var app = express();
var i18n = require('i18n-t')({ supported_languages: ['ru'] });

app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (process.env.NODE_ENV === 'production') {
    var out = fs.createWriteStream(config.log, {flags: 'a'});
    var err = fs.createWriteStream(config.log, {flags: 'a'});
    var stdout = process.stdout;
    var stderr = process.stderr;
    process.__defineGetter__("stdout", function () {
      return out;
    });
    process.__defineGetter__("stderr", function () {
      return err;
    });
    app.use(logger('short'));
} else if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}
app.use(express.static(path.join(__dirname, 'app/')));

app.use('/states', states.create);

app.use(bodyParser());
app.use(method_override());

app.use(clientSessions({
  secret: config.secret,
  cookieName: 'session',
}));

app.use(csrf());
app.use(function (req, res, next) {
  res.locals.csrf = req.csrfToken();
  res.cookie('XSRF-TOKEN', res.locals.csrf);
  next();
});

app.use(function (req, res, next) {
  res.locals.e = function (path) {
    if (res.locals.err && res.locals.err.errors)
      return res.locals.err.errors[path];
  };
  next();
});

app.use(function (req, res, next) {
  res.locals.messages = req.session.messages  || [];
  req.session.messages = [];
  next();
});

app.use(function (req, res, next) {
  res.json_ng = function (obj) {
    var app = this.app;
    var replacer = app.get('json replacer');
    var spaces = app.get('json spaces');
    var body = ")]}',\n" + JSON.stringify(obj, replacer, spaces);

    this.set('Content-Type', 'application/json');
    this.send(body)
  }
  next();
});

app.use(i18n.express());
if (process.env.NODE_ENV === 'test')
  app.i18n = i18n.request();

app.get('/signin', sessions.new);
app.post('/signin', sessions.create);
app.del('/signout', sessions.destroy);

app.get('/forgot', passwordReset.new);
app.post('/forgot', passwordReset.create);
app.get('/reset/:token', passwordReset.edit);
app.post('/reset/:token', passwordReset.update);

app.param('user', users.load);
app.get('/users', users.index);
app.get('/users/:user', users.show);
app.post('/users/:user', users.update);
app.post('/users', users.create);

app.param('device', devices.load);
app.get('/devices', devices.index);
app.get('/devices/:device', devices.show);
app.post('/devices/:device', devices.update);
app.post('/devices', devices.create);
app.get('/devices/:device/setpoints', systems.setpoints);

app.get('/devices/:device/states', states.index);

app.param('site', sites.load);
app.get('/sites', sites.index);
app.get('/sites/:site', sites.show);
app.post('/sites/:site', sites.update);
app.post('/sites', sites.create);

app.param('system', systems.load);
app.get('/sites/:site/systems', systems.index);
app.get('/sites/:site/systems/:system', systems.show);
app.post('/sites/:site/systems/:system', systems.update);
app.post('/sites/:site/systems', systems.create);

app.get('/', authUser, function(req, res) {
  var title = 'asutp.io';
  if (req.operator)
    title = req.operator.name;

  res.render('index', {
    pretty: true,
    title: title,
    operator: req.operator,
  });
});

app.use(function (err, req, res, next) {
  if (err) {
    res.send(err.status || 500);
    if (!process.env.NODE_ENV)
      throw err;
  } else {
    next();
  }
});

var t;
mongoose.connect(config.dbUrl);
mongoose.connection.on('error', function (e) {
  console.error(e);
  if (t) return;
  t = setTimeout(function () {
    t = null;
    mongoose.connect(config.dbUrl);
  }, 10000);
})

mongoose.connection.on('connected', function () {
  console.log('Connected to mongodb at "' + config.dbUrl +'"');
})

process.on('exit', function() {
  mongoose.connection.close();
});

module.exports = app;

// vim:ts=2 sts=2 sw=2 et:
