/* app.js -- application setup
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var path = require('path');
var express = require('express');
var mongoose = require('mongoose');

var users = require('./routes/user');
var sessions = require('./routes/session');

var config = require('./config');

var app = express();

app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (process.env.NODE_ENV !== 'test')
  app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded());

app.get('/signin', sessions.new);
app.post('/signin', sessions.create);

app.param('user', users.load);
app.get('/users/:user', users.show);

app.get('/', function(req, res) {
  res.render('index', { title: 'asutp.io' });
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
