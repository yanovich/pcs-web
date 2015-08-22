/* server.js -- main application file, run it with node.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var cluster = require('cluster');

function startServer() {
  var http = require('http');
  var app = require('./app');

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

if (cluster.isMaster) {
  cluster.setupMaster({silent: true});
  var log = require('./logger'),
      config = require('./config');

  log.enable({transports: config.logTo});

  if (config.slavesCount == 1) {
    startServer();
  } else {
    for (var i = 0; i < config.slavesCount; ++ i) {
      cluster.fork();
    }

    cluster.on('online', function(worker) {
      console.log('Worker: ' + worker.process.pid + ' started');
      log.logProcess(worker.process);
    });

    cluster.on('exit', function(worker) {
      console.error('Worker: ' + worker.process.pid + ' died');
      cluster.fork();
    });
  }
} else {
  startServer();
}
