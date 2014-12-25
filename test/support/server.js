/* test/support/server.js -- start application for testing
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

process.env.NODE_ENV = 'test';

var app = require('../../app')
var port = app.get('port');
var User = require('../../models/user');
var Device = require('../../models/device');
var Site = require('../../models/site');

var async = require('async');
var FactoryLady = require('factory-lady');
var faker = require('faker');

faker.locale = 'ru';

if (!port) {
  var http = require('http');
  var server = http.createServer(app);
  server.listen(app.get('port'));
  port = server.address().port;
}

var userCounter = 0;

User.find().remove(function() {});
Device.find().remove(function() {});
Site.find().remove(function() {});

FactoryLady.define('user', User, {
  password: 'password',
  confirmation: 'password',
  name: function (cb) { cb(faker.name.findName()) },
  email: function (cb) { cb('user-' + ++userCounter + '@example.com') }
})

FactoryLady.define('admin', User, {
  password: 'password',
  confirmation: 'password',
  admin: true,
  name: function (cb) { cb(faker.name.findName()) },
  email: function (cb) { cb('admin-' + ++userCounter + '@example.com') }
})

var deviceCounter = 0;

FactoryLady.define('device', Device, {
  name: function (cb) { cb(faker.lorem.words(1) + ++deviceCounter) }
})

var siteCounter = 0;

FactoryLady.define('site', Site, {
  name: function (cb) { cb(faker.lorem.words(1) + ++siteCounter) }
})
Factory = {
  create: function (key, count, cb) {
    if (typeof(count) === 'function')
      return FactoryLady.create(key, count);

    async.times(count, function (n, next) {
      FactoryLady.create(key, function (o) { next(null, o); });
    }, function (err, items) {
      if (err) throw err;
      cb(items);
    });
  }
};

global.url = 'http://localhost:' + port;
global.i18n = app.i18n;
global.Factory = Factory;

// vim:ts=2 sts=2 sw=2 et:
