var User = require('../../../models/user');
var server = null;
var q = require('q');

exports.config = {
  seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
  specs: ['*.js'],
  capabilities: {
    'browserName': 'chrome',//'phantomjs',
    //'phantomjs.binary.path':'./node_modules/phantomjs/bin/phantomjs',
  },

  onPrepare: function() {
    var app = require('../../../app')
    var port = app.get('port');
    var http = require('http');
    server = http.createServer(app);
    server.listen(app.get('port'));
    port = server.address().port;
    console.log(port);
    browser.params.port = port;

    var defer = q.defer();
    User.remove({}, function() {
      defer.resolve();
    });
    defer.promise.done();
    defer = q.defer();
    User.find({email: "sg@gmail.com"}, function(err, users) {
      if (users && users.length > 0) {
        browser.params.user = users[0];
        defer.resolve(browser.params.user);
      } else {
        User.create({name: "sg", email: "sg@gmail.com", password: "password", confirmation: "password", admin: true}, function(err, user) {
          browser.params.user = user;
          defer.resolve(user);
        });
      }
    });
    defer.promise.done();

  },

  onCleanUp: function(exitCode) {
    console.log("CLEAN UP");
    var deferred = q.defer();
    User.remove({}, function() {
      server.close();
      server = null;
      deferred.resolve(exitCode);
    });
    return deferred.promise;
  },
};

