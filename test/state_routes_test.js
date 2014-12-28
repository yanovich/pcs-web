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

    describe('with correct request params', function () {
      var listeners;
      beforeEach(function () {
        listeners = {};
        req.on = function (key, value) {
          if (!listeners[key])
            listeners[key] = value;
          else
            throw 'redefinition of ' + key;
        };
        req.once = req.on;
        req.removeListener = function (key, value) {
          expect(listeners[key]).to.eql(value);
          delete listeners[key];
        };
        Routes.create(req, res, null);
      });

      it('should add listeners', function () {
        expect(listeners.data).to.be.ok;
        expect(listeners.end).to.be.ok;
        expect(listeners.error).to.be.ok;
        expect(listeners.close).to.be.ok;
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
