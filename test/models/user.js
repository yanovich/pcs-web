/* test/models/user.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var User = require('../../models/user');

var userAttrs = {
  name: "Example User", email: "user@example.com",
  password: 'password', confirmation: 'password',
  resetPasswordToken: "012345", resetPasswordExpires: Date.now()
};

describe('User', function () {
  var user;
  beforeEach(function (done) {
    User.find().remove(done);
    user = new User(userAttrs);
  })

  it('should respond to name', function () {
    expect(user.name).not.to.be.an('undefined');
  });

  it('should respond to email', function () {
    expect(user.email).not.to.be.an('undefined');
  });

  it('should respond to admin', function () {
    expect(user.admin).not.to.be.an('undefined');
  });

  it('should respond to hash', function () {
    expect(user.hash).not.to.be.an('undefined');
  });

  it('should respond to password', function () {
    expect(user.password).not.to.be.an('undefined');
  });

  it('should respond to confirmation', function () {
    expect(user.confirmation).not.to.be.an('undefined');
  });

  it('should respond to resetPasswordToken', function () {
    expect(user.resetPasswordToken).not.to.be.an('undefined');
  });

  it('should respond to resetPasswordExpires', function () {
    expect(user.resetPasswordExpires).not.to.be.an('undefined');
  });

  it('should be valid', function (done) {
    user.validate(function (err) {
      expect(!err).to.be(true);
      done();
    });
  });

  describe('when name is not present', function () {
    it('should not be valid', function (done) {
      user.name = " ";
      user.validate(function(err) {
        expect(!err).to.be(false);
        done();
      });
    });
  })

  describe('when email is not present', function () {
    it('should not be valid', function (done) {
      user.email = " ";
      user.validate(function(err) {
        expect(!err).to.be(false);
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
        expect(!err).to.be(false);
        done();
      });
    });
  })

  describe('when email format is invalid', function () {
    it('should not be valid', function (done) {
      user.email = "user@example,com";
      user.validate(function(err) {
        expect(!err).to.be(false);
        done();
      });
    });
  })

  describe('when email is already taken', function () {
    it('should not be valid', function (done) {
      var dup = new User(userAttrs);
      dup.email = dup.email.toUpperCase();
      dup.save(function (err) {
        expect(!err).to.be(true);
        user.save(function (err) {
          expect(!err).to.be(false);
          done();
        });
      });
    });
  })

  describe('password validations', function () {
    it('should require a password for a new user', function (done) {
      user.password = " ";
      user.validate(function(err) {
        expect(!err.errors['password']).to.be(false);
        done();
      });
    });

    it('should require a password to match its confirmation', function (done) {
      user.confirmation = "invalid";
      user.validate(function(err) {
        expect(!err.errors['confirmation']).to.be(false);
        done();
      });
    });

    it('should reject short passwords', function (done) {
      user.password = user.confirmation = "short";
      user.validate(function(err) {
        expect(!err.errors['password']).to.be(false);
        done();
      });
    });
  })

  describe('password hashing', function () {
    beforeEach(function (done) {
      user.save(done);
    })

    it('should hash password', function () {
      expect(user.hash.length).not.to.be(0);
      expect(user.hash).not.to.be(user.password);
    });

    it('should authenticate a know user with valid password', function (done) {
      user.authenticate('password', function (err, valid) {
        expect(!err).to.be(true);
        expect(valid).to.be(true);
        done();
      });
    });

    it('should not authenticate with invalid password', function (done) {
      user.authenticate('invalid', function (err, valid) {
        expect(!err).to.be(true);
        expect(valid).to.be(false);
        done();
      });
    });
  })
});

// vim:ts=2 sts=2 sw=2 et:
