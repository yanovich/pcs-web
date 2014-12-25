/* test/site_routes_test.js -- test Site routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Routes = require('../routes/site');
var router = require('./support/router');

var siteAttrs = {
  name: "Some site",
};

describe('Site routes', function() {
  var site;
  before(function(done) {
    Factory.create('site', function (s) { site = s; done(); });
  });

  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  describe("#load", function() {
    it("should find by id and assign site to req", function(done) {
      var req = { },
      id = site._id;

      Routes.load(req, {}, function() {
        expect(req.site.toJSON()).to.eql(site.toJSON());
        done();
      }, id);
    });

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

    describe("when operator logged in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
      });

      it("should return 404 if no device", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(404);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(st) {
            expect(Object.keys(st)).to.eql(['_id', 'name']);
            expect(st._id).to.eql(site._id);
            expect(st.name).to.eql(site.name);
            done();
          },
        };
        req.site = site;
        req.site.some_field = true;
        router(Routes.show, req, res);
      });
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
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
      });

      it("should deny non-admins", function(done) {
        res = {
          locals: {},
          send: function(code) {
            expect(code).to.eql(403);
            done();
          },
        };
        router(Routes.update, req, res);
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:

