/* app.js -- application setup
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var express = require('express');
var path = require('path');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (process.env.NODE_ENV !== 'test')
  app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render('index', { title: 'asutp.io' });
});

module.exports = app;

// vim:ts=2 sts=2 sw=2 et:
