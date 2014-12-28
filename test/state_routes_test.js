/* test/state_routes_test.js -- test State routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

var expect = require('expect.js');

var Routes = require('../routes/state');
var router = require('./support/router');

describe('State routes', function () {
  describe("#index", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.index, req, res);
    });
  });

  describe("#create", function() {
    var req, res;

    beforeEach(function () {
      req = { method: 'PUT', headers: {'content-type': 'application/x-device-data' } };
      res = {};
    });

    it("should check HTTP PUT method", function(done) {
      req.method = 'POST';
      Routes.create(req, res, done);
    });

    it("should check content type", function(done) {
      req.method = 'PUT';
      req.headers = { 'content-type': 'text/html' }
      Routes.create(req, res, done);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
