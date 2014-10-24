/* test/app/zombie/spec_helper -- test runner
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('../../../app')
var port = app.get('port');
var mongoose = require('mongoose');
var Browser = require('zombie');
require('jasmine-before-all');

var server = null;

this.browser = new Browser({debug: true, maxWait: 20, silent: true});
this.url = "";

require('fs').readdirSync(__dirname + '/../../../models').forEach(function(file) {
  if (file.match(/^[a-z]+\.js/g) !== null) {
    this[file.charAt(0).toUpperCase() + file.slice(1, -3)] = require('../../../models/' + file);
  }
});

var seeder = require('./seed');
Object.keys(seeder).forEach(function(item) {
  this[item] = seeder[item];
}, this);

jasmine.getEnv().defaultTimeoutInterval = 30000;

describe("ASUTP.IO", function() {
  beforeAll(function(done) {
    if (!port) {
      var http = require('http');
      server = http.createServer(app);
      server.listen(app.get('port'));
      port = server.address().port;
    }
    url = 'http://localhost:' + port;
    seed.down(function() {
      seed.up(function() {
        done();
      });
    });
  });

 /* require('fs').readdirSync(__dirname + '/').forEach(function(file) {
    if (file.match(/.+_spec\.js/g) !== null) {
      require('./' + file);
    }
  });*/
  require('./users_spec');

  afterAll(function(done) {
    seed.down(function() {
      if (!!server) {
        server.close(function() {
          mongoose.connection.close(function() {
            done();
          });
        });
      } else {
        done();
      }
    });
  });
});

