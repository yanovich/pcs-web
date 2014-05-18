/* app.js -- application setup
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var path = require('path');
var express = require('express');
var logger = require('morgan');
var body_parser = require('body-parser');
var method_override = require('method-override');
var csrf = require('csurf');
var mongoose = require('mongoose');
var clientSessions = require("client-sessions");

var users = require('./routes/user');
var sessions = require('./routes/session');
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

if (process.env.NODE_ENV !== 'test')
  app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'app/')));

app.use(body_parser.urlencoded());
app.use(method_override());

app.use(clientSessions({
  secret: config.secret,
  cookieName: 'session',
}));

app.use(csrf());
app.use(function (req, res, next) {
  res.locals.csrf = req.csrfToken();
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

app.use(i18n.express());
if (process.env.NODE_ENV === 'test')
  app.i18n = i18n.request();

app.get('/signin', sessions.new);
app.post('/signin', sessions.create);
app.del('/signout', sessions.destroy);

app.get('/', authUser, function(req, res) {
  var title = 'asutp.io';
  if (req.operator)
    title = req.operator.name + ' ' + title;

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

mongoose.connect(config.dbUrl);

process.on('exit', function() {
  mongoose.connection.close();
});

module.exports = app;

// vim:ts=2 sts=2 sw=2 et:
