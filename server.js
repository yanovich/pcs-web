/* server.js -- main application file, run it with node.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var config = require('./config');
var cluster = require('cluster');

function startServer() {
  var http = require('http');
  var app = require('./app');

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

if (cluster.isMaster) {
  if (config.slavesCount == 1) {
    startServer();
  } else {
    for (var i = 0; i < config.slavesCount; ++ i) {
      cluster.fork();
    }

    cluster.on('online', function(worker) {
      console.log('Worker: ' + worker.process.pid + ' started');
    });

    cluster.on('exit', function(worker) {
      console.error('Worker: ' + worker.process.pid + ' died');
      cluster.fork();
    });
  }
} else {
  startServer();
}

// vim:ts=2 sts=2 sw=2 et:
