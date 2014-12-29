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
  var device;
  before(function(done) {
    Factory.create('device', function (d) { device = d; done(); });
  });

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

      describe('adds onData which', function () {
        describe('before receiveing device', function () {
          it('should ignore newlines', function () {
            listeners.data('\n');
          });

          it('should abort when bad JSON', function () {
            var c;
            res.send = function (code) {
              c = code;
            };
            listeners.data('{ device: 3');
            expect(c).to.be(500);
            expect(listeners).to.be.empty;
          });

          it('should abort when no device', function () {
            var c;
            res.send = function (code) {
              c = code;
            };
            listeners.data('{ "a": 3 }');
            expect(c).to.be(500);
            expect(listeners).to.be.empty;
          });

          it('should abort when bad device', function () {
            var c;
            res.send = function (code) {
              c = code;
            };
            listeners.data('{ "device": 3 }');
            expect(c).to.be(500);
            expect(listeners).to.be.empty;
          });
        });

        describe('after receiveing device', function () {
          var code, response;
          beforeEach(function (done) {
            res.writeHead = function (c) { code = c; };
            res.write = function (r) { response = r; done(); };
            listeners.data('{ "device": "' + device._id + '" }');
          });

          it('should report success', function () {
            expect(code).to.be(200);
            expect(response).to.be('ok');
          });

          it('should respond to newline', function (done) {
            res.write = function (response) {
              expect(response).to.be('\n');
              done();
            };
            listeners.data('\n');
          });
        });
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
