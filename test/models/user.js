/* test/models/user.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var User = require('../../models/user');

describe('User', function () {
  var user;
  beforeEach(function () {
    user = new User({ name: "Example User", email: "user@example.com" });
  })

  it('should respond to name', function () {
    expect(user.name).not.to.be.an('undefined');
  });

  it('should respond to email', function () {
    expect(user.email).not.to.be.an('undefined');
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
});

// vim:ts=2 sts=2 sw=2 et:
