/* test/state_routes_test.js -- test State routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

var expect = require('expect.js');

var State = require('../models/state');
var Routes = require('../routes/state');
var router = require('./support/router');

describe('State routes', function () {
  var device;
  before(function(done) {
    Factory.create('device', function (d) { device = d; done(); });
  });

  var device1;
  before(function(done) {
    Factory.create('device', function (d) { device1 = d; done(); });
  });

  var site;
  before(function(done) {
    Factory.create('site', function (s) { site = s; done(); });
  });

  before(function(done) {
    Factory.create('system',
        { site: site._id, device: device1._id, setpoints: { a: 1 } },
        function () { done(); });
  });

  before(function(done) {
    Factory.create('system',
        { site: site._id, device: device1._id, setpoints: { b: 2 } },
        function () { done(); });
  });

  describe("#index", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {}, headers: {} },
      res = { send: function(code) {
        expect(code).to.eql(401);
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

          it('should abort when bad device', function (done) {
            res.send = function (code) {
              expect(code).to.be(500);
              setTimeout(function () {
                expect(listeners).to.be.empty;
                done();
              }, 0)
            };
            listeners.data('{ "device": 3 }');
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

          it('should abort on bad JSON', function () {
            var end;
            res.end = function () { end = true; };
            listeners.data('{ "device');
            expect(listeners).to.be.empty;
          });

          it('should save state on good JSON', function (done) {
            State.count({ device: device._id }, function (err, count) {
              var interval, timer;
              function recount () {
                State.count({ device: device._id }, function (err, newCount) {
                  expect(err).not.to.be.ok;
                  if (newCount > count) {
                    clearInterval(interval);
                    clearTimeout(timer);
                    done();
                  }
                });
              };
              expect(err).not.to.be.ok;
              timer = setTimeout(function () {
                clearInterval(interval);
                expect(count).not.to.be(count);
                done();
              }, 300);
              interval = setInterval(recount, 25);
              listeners.data('{ "a": 1, "b": 2 }');
            });
          });
        });

        describe('after receiveing device with setpoints', function () {
          var code, response;
          beforeEach(function (done) {
            res.writeHead = function (c) { code = c; };
            res.write = function (r) { response = r; done(); };
            listeners.data('{ "device": "' + device1._id + '" }');
          });

          it('should report setpoints', function (done) {
            res.write = function (r) {
              expect(r).to.eql(JSON.stringify({a: 1, b: 2}));
              done();
            };
            listeners.data('{ "c": 3 }');
          });
        });
      });
    });
  });
});
