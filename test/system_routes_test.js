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

  var device;
  before(function(done) {
    Factory.create('device', function (d) { device = d; done(); });
  });

  var system;
  before(function(done) {
    Factory.create('system', {site: site._id, device: device._id}, function (l) {
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
      var req = { session: { operatorId: operator._id } };
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
      var req = { session: { operatorId: operator._id } };
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
  });
});

// vim:ts=2 sts=2 sw=2 et:
