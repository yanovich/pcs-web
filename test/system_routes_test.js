/* test/system_routes_test.js -- test System routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Routes = require('../routes/system');
var router = require('./support/router');
var System = require('../models/system');

describe('System routes', function() {
  var site;
  before(function(done) {
    Factory.create('site', function (s) { site = s; done(); });
  });

  var device, device2;
  before(function(done) {
    Factory.create('device', 2, function (l) {
      device = l[0];
      device2 = l[1];
      done();
    });
  });

  var system;
  before(function(done) {
    Factory.create('system', {
      site: site._id,
      device: device._id,
      outputs: [ 'a' ],
      setpoints: { a: 1 },
    }, function (l) {
      system = l;
      done();
    });
  });

  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  describe("#load", function() {
    it("should respond with not found code", function(done) {
      var res = {
        send: function(code) {
          expect(code).to.eql(404);
          done();
        }
      };
      Routes.load({}, res, null, 0);
    });
  });

  describe("#show", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.show, req, res);
    });

    it("should return only accessible fields", function(done) {
      var req = { session: { operator: operator.email } };
      var res = {
        locals: {},
        json_ng: function(st) {
          expect(Object.keys(st)).not.to.contain('some_field');
          expect(st._id).to.be(system._id);
          done();
        },
      };
      req.system = system;
      req.system.some_field = true;
      router(Routes.show, req, res);
    });
  });

  describe("#setpoints", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.setpoints, req, res);
    });

    it("should be protected against cross-site scripting", function(done) {
      var req = { session: { operator: operator.email } };
      var res = {
        locals: {},
        json_ng: function() {
          done();
        },
      };
      req.device = device;
      router(Routes.setpoints, req, res);
    });
  });

  describe("#update", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.update, req, res);
    });

    describe("when operator signed in", function() {
      var req, res = {};

      beforeEach(function() {
        req = { session: { operator: operator.email } };
        res.locals = {};
      });

      it("should limit access to existing setpoints", function (done) {
        res.json = function(s) {
          expect(s.name).to.eql(system.name);
          System.findOne({ site: system.site, name: system.name }, function (err, s) {
            if (err) throw err;
            expect(s.device).to.eql(system.device);
            expect(s.setpoints.a).to.be(2);
            done();
          });
        }
        req.system = system;
        req.body = {
          name: system.name,
          device: device2._id,
          outputs: system.outputs,
          setpoints: { a: 2 },
        };
        router(Routes.update, req, res);
      });

      it("should ensure setpoints match 1-for-1");
    });
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
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.create, req, res);
    });

    it("should deny access to non-admin users", function(done) {
      var req = { session: { operator: operator.email } },
      res = { send: function(code) {
        expect(code).to.be(403);
        done();
      }, locals: {} };
      router(Routes.create, req, res);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
