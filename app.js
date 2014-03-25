/* app.js -- application setup
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var clientSessions = require("client-sessions");

var twbs = require.resolve('bootstrap-browser').split('bootstrap-browser')[0];

var users = require('./routes/user');
var sessions = require('./routes/session');
var auth = require('./routes/_auth');
var authUser = auth.authenticate;

var config = require('./config');

var app = express();
var i18n = require('i18n-t')({ supported_languages: ['ru'] });

app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (process.env.NODE_ENV !== 'test')
  app.use(express.logger('dev'));
app.use('/static',
    express.static(path.join(__dirname, 'public/stylesheets/')));
app.use('/static/bootstrap',
    express.static(path.join(twbs, 'bootstrap-browser/dist/css')));
app.use('/static/bootstrap',
    express.static(path.join(twbs, 'bootstrap-browser/js')));
app.use('/static/fonts',
    express.static(path.join(twbs, 'bootstrap-browser/dist/fonts')));
app.use('/static/jquery', express.static(path.join(
        path.dirname(require.resolve('jquery-browser')), 'lib/')));
app.use(express.urlencoded());
app.use(express.methodOverride());


app.use(clientSessions({
  secret: config.secret,
  cookieName: 'session',
}));

app.use(express.csrf());
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

app.use(i18n.express());
if (process.env.NODE_ENV === 'test')
  app.i18n = i18n.request();

app.get('/signin', sessions.new);
app.post('/signin', sessions.create);
app.del('/signout', sessions.destroy);

app.param('user', users.load);
app.get('/users/:user', users.show);
app.put('/users/:user', users.update);

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
  if (err)
    console.log(err);

  next(err);
});

mongoose.connect(config.dbUrl);

process.on('exit', function() {
  mongoose.connection.close();
});

module.exports = app;

// vim:ts=2 sts=2 sw=2 et:
