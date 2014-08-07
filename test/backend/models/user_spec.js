'use strict'
/* test/models/user_spec.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

require('../spec_helper');
var User = require('../../../models/user');

var userAttrs = {
  name: "Example User",
  email: "user@example.com",
  password: 'password',
  confirmation: 'password',
};

var secondUserAttrs = {
  name: "Example User 2",
  email: "user2@example.com",
  password: 'password',
  confirmation: 'password',
};

describe('User', function() {
  var user;
  beforeEach(function(done) {
    user = new User(userAttrs);
    return done();
  });

  describe("#scheme", function() {
    it('should respond to name', function () {
      expect(user.name).toBeDefined();
    });

    it('should respond to email', function () {
      expect(user.email).toBeDefined();
    });

    it('should respond to admin', function () {
      expect(user.admin).toBeFalsy();
    });

    it('should respond to password', function () {
      expect(user.password).toBeDefined();
    });

    it('should respond to confirmation', function () {
      expect(user.confirmation).toBeDefined();
    });

    it('should respond to hash', function() {
      expect(user.hash).toEqual("");
    });
  });

  describe("#generateResetPasswordToken", function() {
    var resetUser = null;
    beforeEach(function() {
      resetUser = new User(secondUserAttrs);
    });

    it("should generate expires properties", function(done) {
      var now = Date.now();

      expect(resetUser.resetPasswordToken).toBeUndefined();
      expect(resetUser.resetPasswordExpires).toBeUndefined();
      expect(resetUser.isNew).toBeTruthy();

      Date.now = jasmine.createSpy("date.now").andReturn(now);
      resetUser.generateResetPasswordToken(function(err, token) {
        expect(resetUser.resetPasswordToken).toBeDefined();
        expect(resetUser.resetPasswordExpires).toBeDefined();
        expect(resetUser.resetPasswordToken).toEqual(token);
        expect(resetUser.resetPasswordExpires).toEqual(new Date(now + 60 * 60 * 1000));
        expect(resetUser.isNew).toBeFalsy();
        done();
      });
    });
  });

  describe("#resetPassword", function() {
    var resetUser = null;
    beforeEach(function(done) {
      resetUser = new User(secondUserAttrs);
      resetUser.generateResetPasswordToken(done);
    });

    it("should reset password", function(done) {
      expect(resetUser.resetPasswordToken).toBeDefined();
      expect(resetUser.resetPasswordExpires).toBeDefined();

      resetUser.authenticate("some new pass", function(err, authenticated) {
        expect(authenticated).toBeFalsy();
        resetUser.resetPassword("some new pass", "some new pass", function(err) {
          expect(err).toBe(null);
          resetUser.authenticate("some new pass", function(err, authenticated) {
            expect(authenticated).toBeTruthy();
            done();
          });
        });
      });
    });
  });

  describe("#validate", function() {
    it('should be valid', function (done) {
      user.validate(function (err) {
        expect(err).toBeFalsy();
        done();
      });
    });

    describe('when name is not present', function () {
      it('should not be valid', function (done) {
        user.name = " ";
        user.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    })

    describe('when email is not present', function () {
      it('should not be valid', function (done) {
        user.email = " ";
        user.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    })

    describe('when name is too long', function () {
      it('should not be valid', function (done) {
        var name = "";
        for (var i = 0; i < 51; i++)
        name += 'a';
        user.name = name;
        user.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    })

    describe('when email format is invalid', function () {
      it('should not be valid', function (done) {
        user.email = "user@example,com";
        user.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    })

    describe('when email is already taken', function () {
      it('should not be valid', function (done) {
        var dup = new User(userAttrs);
        dup.email = dup.email.toUpperCase();
        dup.save(function (err) {
          expect(err).toBeFalsy();
          user.save(function (err) {
            expect(err).toBeTruthy();
            done();
          });
        });
      });
    })

    describe('password validations', function () {
      it('should require a password for a new user', function (done) {
        user.password = " ";
        user.validate(function(err) {
          expect(err.errors['password']).toBeTruthy();
          done();
        });
      });

      it('should require a password to match its confirmation', function (done) {
        user.confirmation = "invalid";
        user.validate(function(err) {
          expect(err.errors['confirmation']).toBeTruthy();
          done();
        });
      });

      it('should reject short passwords', function (done) {
        user.password = user.confirmation = "short";
        user.validate(function(err) {
          expect(err.errors['password']).toBeTruthy();
          done();
        });
      });
    })
  });

  describe('password hashing', function () {
    beforeEach(function (done) {
      user.save(done);
    })

    it('should hash password', function () {
      expect(user.hash.length).not.toEqual(0);
      expect(user.hash).not.toEqual(user.password);
    });

    it('should authenticate a know user with valid password', function (done) {
      user.authenticate('password', function (err, valid) {
        expect(err).toBeFalsy();
        expect(valid).toBeTruthy();
        done();
      });
    });

    it('should not authenticate with invalid password', function (done) {
      user.authenticate('invalid', function (err, valid) {
        expect(err).toBeFalsy();
        expect(valid).toBeFalsy();
        done();
      });
    });
  });

  describe('email converting to lowcase', function() {
    it("should convert email", function(done) {
      user.email = "low.CASE@emaiL.cOm";
      user.save(function(err, newUser) {
        expect(newUser.email).toEqual("low.case@email.com");
        done();
      });
    });
  });
});

