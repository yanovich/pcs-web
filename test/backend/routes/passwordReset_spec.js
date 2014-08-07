'use strict'
/* test/backend/routes/passwordReset_spec.js -- test passwordReset routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

require('../spec_helper');
var User = require('../../../models/user');
var Mailer = require('../../../routes/_mailer');
var Routes = require('../../../routes/passwordReset');

var userAttrs = {
  name: "Example User",
  email: "user@example.com",
  password: 'password',
  confirmation: 'password',
};

describe('passwordReset\'s routes', function() {
  var user;
  beforeEach(function(done) {
    (new User(userAttrs)).save(function(err, newUser) {
      if (err) throw err;
      user = newUser;
      return done();
    });
  });

  describe("#new", function() {
    describe("when session is not established", function() {
      it("should render new", function() {
        var req = { session: {} },
            res = { render: jasmine.createSpy("res.render"), };

        Routes.new(req, res);

        expect(res.render).toHaveBeenCalledWith("password_reset/new", { title: "Reset password" });
      });
    });

    describe("when session exist", function() {
      it("should search user and return internal server error", function(done) {
        var req = { session: { operatorId: 34567 } },
            res = { send: function(code, msg) {
                      expect(code).toEqual(500);
                      expect(msg).toEqual('Sorry, internal server error.');
                      done();
                    }
            };
        Routes.new(req, res);
      });

      it("should search user and render reset page", function(done) {
        var req = { session: { operatorId: require('mongoose').Types.ObjectId() } },
            res = { render: function(path, opts) {
                      expect(path).toEqual("password_reset/new");
                      expect(opts).toEqual({ title: "Reset password" });
                      done();
                    },
            };
        Routes.new(req, res);
      });

      it("should search user and redirect if user exists", function(done) {
        var req = { session: { operatorId: user._id } },
            res = { redirect: function(path) {
                      expect(path).toEqual("/");
                      done();
                    },
            };
        Routes.new(req, res);
      });
    });
  });

  describe("#create", function() {
    describe("when user not found", function() {
      it("should render new page", function(done) {
        var req = { body: { email: "somemail" } },
        res = { locals: {} };

        res.render = function(path, opts) {
          expect(path).toEqual("password_reset/new");
          expect(opts).toEqual({ title: "Reset password" });
          expect(res.locals.err).toEqual({ errors: { email: { type: 'missing' } } });
          done();
        };

        Routes.create(req, res);
      });
    });

    describe("when user found", function() {
      var res, req;
      beforeEach(function() {
        req = { body: { email: user.email }, headers: { host: "192.168.1.1" } };
        res = { locals: {} };

        req.t = jasmine.createSpy("req.t").andReturn(0);
      });

      it("should generate reset token", function(done) {
        expect(user.resetPasswordToken).toBeUndefined();
        expect(user.resetPasswordExpires).toBeUndefined();

        mailer.send = function() {
          User.findOne({_id: user._id}, function(err, newUser) {
            if(err) throw err;
            user = newUser;
            expect(user.resetPasswordToken).toBeDefined();
            expect(user.resetPasswordExpires).toBeDefined();
            done();
          });
        }

        Routes.create(req, res);
      });

      it("should send mail to user with right information", function(done) {
        mailer.send = function(opts) {
          var expectedOpts = {
            to: user.email,
            from: 'noreply@asutp.io',
            subject: 0,
            text: 0,
          };
          User.findOne({_id: user._id}, function(err, newUser) {
            if(err) throw err;
            user = newUser;
            expect(req.t).toHaveBeenCalledWith('password_reset.mail.token.subject');
            expect(req.t).toHaveBeenCalledWith('password_reset.mail.token.body', {link: 'http://192.168.1.1/reset/' + user.resetPasswordToken});
            expect(opts).toEqual(expectedOpts);
            done();
          });
        }

        Routes.create(req, res);
      });

      it("should send internal server error if mailer failed", function(done) {
        res.send = jasmine.createSpy("res.send");
        mailer.send = function(opts, f) {
          f("some err");
          expect(res.send).toHaveBeenCalledWith(500, 'Sorry, internal server error.');
          done();
        }

        Routes.create(req, res);
      });

      it("should render new", function(done) {
        res.render = jasmine.createSpy("res.render");
        mailer.send = function(opts, f) {
          f();
          expect(res.locals.notify).toEqual({ message: 0 });
          expect(req.t).toHaveBeenCalledWith('password_reset.token.notify', {email: user.email});
          expect(res.render).toHaveBeenCalledWith('password_reset/new', { title: "Reset password" });
          done();
        }

        Routes.create(req, res);
      });
    });
  });

  describe("#edit", function() {
    it("should send internal server error if user not found", function(done) {
      var res = {}, req = { params: { token: "11"} };
      res.send = function(code, msg) {
        expect(code).toEqual(500);
        expect(msg).toEqual('Sorry, internal server error.');
        done();
      };

      Routes.edit(req, res);
    });

    it("should render edit page", function(done) {
      user.generateResetPasswordToken(function(err) {
        if (err) throw err;
        var res = {}, req = { params: { token: user.resetPasswordToken } };
        res.render = function(path, opts) {
          expect(path).toEqual("password_reset/edit");
          expect(opts).toEqual({ title: "Change password" });
          done();
        };

        Routes.edit(req, res);
      });
    });
  });

  describe("#update", function() {
    it("should send internal server error if user not found", function(done) {
      var res = {}, req = { params: { token: "11"} };
      res.send = function(code, msg) {
        expect(code).toEqual(500);
        expect(msg).toEqual('Sorry, internal server error.');
        done();
      };

      Routes.update(req, res);
    });

    describe("when valid token", function() {
      var res = {}, req = { params: { token: null } };

      beforeEach(function(done) {
        user.generateResetPasswordToken(function(err) {
          if (err) throw err;
          req.params.token = user.resetPasswordToken;
          done();
        });
      });

      it("should send internal server error if reset password failed", function(done) {
        req.body = {};
        req.body.password = "12345678";
        req.body.confirmation = "012345678";
        res.send = function(code, msg) {
          expect(code).toEqual(500);
          expect(msg).toEqual('Sorry, internal server error.');
          done();
        };

        Routes.update(req, res);
      });

      describe("when passwords is ok", function() {
        beforeEach(function() {
          req.body = {};
          req.body.password = "12345678";
          req.body.confirmation = "12345678";

          req.t = jasmine.createSpy("req.t").andReturn(1);
        });

        it("should send mail to user with right information", function(done) {
          mailer.send = function(opts) {
            var expectedOpts = {
              to: user.email,
              from: 'noreply@asutp.io',
              subject: 1,
              text: 1,
            };
            expect(req.t).toHaveBeenCalledWith('password_reset.mail.reset.subject');
            expect(req.t).toHaveBeenCalledWith('password_reset.mail.reset.body', { user: user.email });
            expect(opts).toEqual(expectedOpts);
            done();
          }

          Routes.update(req, res);
        });

        it("should send internal server error if mailer failed", function(done) {
          res.send = jasmine.createSpy("res.send");
          mailer.send = function(opts, f) {
            f("some err");
            expect(res.send).toHaveBeenCalledWith(500, 'Sorry, internal server error.');
            done();
          }

          Routes.update(req, res);
        });

        it("should render new", function(done) {
          res.redirect = jasmine.createSpy("res.redirect");
          mailer.send = function(opts, f) {
            f();
            expect(res.redirect).toHaveBeenCalledWith('/signin');
            done();
          }

          Routes.update(req, res);
        });
      });
    });
  });
});


