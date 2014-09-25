'use strict'
/* test/backend/routes/_auth_spec.js -- test auth helper methods
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var User = require('../../../models/user');
var Routes = require('../../../routes/_auth');

var userAttrs = {
  name: "Example User",
  email: "user@example.com",
  password: 'password',
  confirmation: 'password',
};

describe('Authentication helper', function() {
  var user;
  beforeEach(function(done) {
    (new User(userAttrs)).save(function(err, newUser) {
      user = newUser;
      return done();
    });
  });

  describe("#authenticate", function() {
    it("should redirect to signin if session is not inited", function(done) {
      var req = { session: {}, url: "someurl" },
          res = { redirect: function(url) {
            expect(req.session.returnTo).toEqual("someurl");
            expect(url).toEqual("/signin");
            done();
          }};

      Routes.authenticate(req, res, null);
    });

    it("should return 500 code if user is not found", function(done) {
      var req = { session: { operatorId: 2220 } },
          res = { send: function(code, msg) {
            expect(code).toEqual(500);
            expect(msg).toEqual('Sorry, internal server error.');
            done();
          }};

      Routes.authenticate(req, res, null);
    });

    //don't know how to check !user condition

    it("should assign operator", function(done) {
      var req = { session: { operatorId: user._id } },
          res = { locals: { } },
          next = function() {
            expect(res.locals.operator.toJSON()).toEqual(user.toJSON());
            expect(req.operator.toJSON()).toEqual(user.toJSON());
            done();
          };

      Routes.authenticate(req, res, next);
    });
  });
});


