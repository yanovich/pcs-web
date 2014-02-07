/* test/support/server.js -- start application for testing
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('../../app')
var port = app.get('port');

if (true) {
  var http = require('http');
  var server = http.createServer(app);
  server.listen(app.get('port'));
  port = server.address().port;
}

global.url = 'http://localhost:' + port;

// vim:ts=2 sts=2 sw=2 et:
