/* server.js -- main application file, run it with node.js
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

app.use(express.logger('dev'));

app.get('/', function(req, res) {
  res.render('index', { title: 'asutp.io' });
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// vim:ts=2 sts=2 sw=2 et:
