/* test/views/session.js -- test session pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var browser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var User = require('../../models/user');
var attrs = { name: "Example User2", email: "user-2@example.com",
      password: 'password', confirmation: 'password' }

describe('signin page', function() {
  var user;

  before( function (done) {
    user = new User(attrs);
    user.save(done);
  });

  beforeEach( function (done) {
    browser = new Browser({ site: global.url });
    browser.visit('/signin').then(done, done);
  });

  it('should display prompt', function() {
    expect(browser.statusCode).to.be(200);
    expect(browser.text('title')).to.contain('Sign in');
  })

  describe('with invalid information', function () {
    it('should decline signin', function (done) {
      browser
        .pressButton(t('session.sign_in'))
        .then(function () {
          expect(browser.success).to.be(true);
          expect(browser.queryAll('div.form-group.has-error').length).to.be(1);
          expect(browser.text('label.help-block')).to.be(t('mongoose.signin'));
        })
        .then(done, done);
    })
  })

  describe('with valid information', function () {
    beforeEach(function (done) {
      browser
        .fill(t('user.email'), attrs.email)
        .fill(t('user.password'), attrs.password)
        .pressButton(t('session.sign_in'))
        .then(done, done)
    })

    it('should accept user', function () {
      expect(browser.success).to.be(true);
      expect(browser.queryAll('div.form-group.has-error').length).to.be(0);
      expect(browser.location.pathname).to.be('/');
      expect(browser.text('title')).to.contain(attrs.name);
    })

    describe('on revisit', function () {
      beforeEach(function (done) {
        browser
          .visit('/signin')
          .then(done, done)
      })

      it('should render /', function () {
        expect(browser.location.pathname).to.be('/');
      })
    })

    describe('followed by signout', function () {
      beforeEach(function (done) {
        browser
          .pressButton(t('session.sign_out'))
          .then(done, done)
      })

      it('should destroy session', function () {
        expect(browser.location.pathname).to.be('/signin');
        expect(browser.text('title')).to.contain('Sign in');
      })
    })
  })
});

describe('authorization', function() {
  beforeEach( function () {
    browser = new Browser({ site: global.url });
  });

  describe('of non-signed-in users', function () {
    describe('accessing root page', function () {
      beforeEach(function (done) {
        browser
          .visit('/')
          .then(done, done)
      })

      it('should require sign in', function () {
        expect(browser.location.pathname).to.be('/signin');
      })
    })
  })
});
// vim:ts=2 sts=2 sw=2 et:
