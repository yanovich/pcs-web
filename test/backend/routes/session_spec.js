'use strict'
/* test/backend/routes/session_spec.js -- test Session routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

require('../spec_helper');
var User = require('../../../models/user');
var Routes = require('../../../routes/session');

var userAttrs = {
  name: "Example Operator User",
  email: "user@example.com",
  password: 'password',
  confirmation: 'password',
};

describe('Device\'s routes', function() {
  var user, utils;
  beforeEach(function(done) {
    (new User(userAttrs)).save(function(err, newUser) {
      user = newUser;
      utils = require('./_controller_util')(user, user);
      return done();
    });
  });

  describe("#new", function() {
    it("should render html if session is not exist", function() {
      var req = { session: {} },
          res = { render: jasmine.createSpy() };

      Routes.new(req, res);
      expect(res.render).toHaveBeenCalledWith("sessions/new", {title: 'Sign in'});
    });

    it("should render html if user is not found", function(done) {
      var user2Attrs = {
        name: "User",
        email: "user2@example.com",
        password: 'password',
        confirmation: 'password',
      };
      (new User(user2Attrs)).save(function(err, user2) {
        var id = user2._id;
        User.remove(user2, function() {
          var req = { session: { operatorId: id } },
          res = { render: function(path, options) {
            expect(path).toEqual("sessions/new");
            expect(options).toEqual({title:'Sign in'});
            done();
          }};

          Routes.new(req, res);
        });
      });
    });

    it("should send internal server error on fail", function(done) {
      var req = { session: { operatorId: 1 } },
      res = { send: function(code, msg) {
        expect(code).toEqual(500);
        expect(msg).toEqual('Sorry, internal server error.');
        done();
      }};

      Routes.new(req, res);
    });

    it("should redirect if user found", function(done) {
      var req = { session: { operatorId: user._id } },
      res = { redirect: function(path) {
        expect(path).toEqual('/');
        done();
      }};

      Routes.new(req, res);
    });
  });
  describe("#create", function() {
    it("should fail if email is not valid", function(done) {
      var req = { body: { email: "a" } },
          res = {
            locals: {},
            render: function(path, options) {
              expect(res.locals).toEqual({err: { errors: { password: { type: 'signin' } } }});
              expect(path).toEqual("sessions/new");
              expect(options).toEqual({title:'Sign in'});
              done();
            }
          };
      utils.executer(Routes.create.slice(0), req, res);
    });
    it("should fail if password is not specified", function(done) {
      var req = { body: { email: user.email } },
          res = {
            locals: {},
            send: function(code, msg) {
              expect(code).toEqual(500);
              expect(msg).toEqual('Sorry, internal server error.');
              done();
            }
          };
      utils.executer(Routes.create.slice(0), req, res);
    });
    it("should fail if password is invalid", function(done) {
      var req = { body: { email: user.email, password: "a" } },
          res = {
            locals: {},
            render: function(path, options) {
              expect(res.locals).toEqual({err: { errors: { password: { type: 'signin' } } }});
              expect(path).toEqual("sessions/new");
              expect(options).toEqual({title:'Sign in'});
              done();
            }
          };
      utils.executer(Routes.create.slice(0), req, res);
    });
    it("should redirect authenticated user", function(done) {
      var req = { body: { email: user.email, password: "password" }, session: {} },
      res = {
        redirect: function(path) {
          expect(req.session).toEqual({operatorId: user._id});
          expect(path).toEqual("/");
          done();
        }
      };
      utils.executer(Routes.create.slice(0), req, res);
    });
    it("should redirect authenticated user to specified path", function(done) {
      var req = { body: { email: user.email, password: "password" }, session: { returnTo: "/hello" } },
      res = {
        redirect: function(path) {
          expect(req.session).toEqual({operatorId: user._id});
          expect(req.returnTo).toBeUndefined();
          expect(path).toEqual("/hello");
          done();
        }
      };
      utils.executer(Routes.create.slice(0), req, res);
    });
  });

  describe("#destroy", function() {
    it("should authorize user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      utils.executer(Routes.destroy.slice(0), req, res);
    });
    it("should clear session", function(done) {
      var req = { session: { operatorId: user._id } },
      res = { redirect: function(url) {
        expect(req.session.operatorId).toBeUndefined();
        expect(url).toEqual("/signin");
        done();
      },
      locals: {}
      };
      utils.executer(Routes.destroy.slice(0), req, res);
    });
  });
});

