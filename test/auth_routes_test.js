/* test/auth_route_spec.js -- test Authentication helper
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Routes = require('../routes/_auth');
var User = require('../models/user');

describe('Authentication helper', function() {
  describe("#authenticate", function() {
    describe("when request for not html page", function() {
      it("should send 401 if session is not inited", function(done) {
        var req = { session: {}, url: "someurl", headers: {accept: 'application/json'} },
            res = { send: function(code) {
              expect(code).to.eql(401);
              done();
            }};

        Routes.authenticate(req, res, null);
      });

      it("should send 401 if user is not found", function(done) {
        var req = { session: { operator: 2220 }, headers: {accept: 'application/json'} },
            res = { send: function(code) {
              expect(code).to.eql(401);
              done();
            }};

        Routes.authenticate(req, res, null);
      });
    });

    describe("when request for html page", function() {
      it("should redirect to signin if session is not inited", function(done) {
        var req = { session: {}, url: "someurl", headers: {accept: 'application/html'} },
            res = { redirect: function(url) {
              expect(url).to.eql("/signin");
              done();
            }};

        Routes.authenticate(req, res, null);
      });

      it("should reload if user is not found", function(done) {
        var req = { session: { operator: 2220 }, headers: {accept: 'application/html'} },
            res = { redirect: function(url) {
              expect(url).to.eql('/signin');
              done();
            }};

        Routes.authenticate(req, res, null);
      });
    });

    it("should assign operator", function(done) {
      var user = null;
      var userAttrs = {
        name: "Example User",
        email: "user@example.com",
        password: 'password',
        confirmation: 'password',
      };
      (new User(userAttrs)).save(function(err, user) {
        var req = { session: { operator: user.email } },
            res = { locals: { } },
            next = function() {
              expect(res.locals.operator.toJSON()).to.eql(user.toJSON());
              expect(req.operator.toJSON()).to.eql(user.toJSON());
              done();
            };

        Routes.authenticate(req, res, next);
      });
    });
  });
});
