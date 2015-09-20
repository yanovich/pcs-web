/* test/registration_pages_test.js -- test registration pages, run it with mocha
 * Copyright 2015 Sergei Ianovich
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

var User = require('../models/user');

describe('Registration', function () {
  before( function () {
    browser = new Browser({ site: global.url });
  });

  describe('access to signup from signin', function() {
    beforeEach( function (done) {
      browser.visit('/signin').then(done, done);
    });

    it('should display prompt', function() {
      expect(browser.text('a[href="/signup"]')).to.contain(t('session.sign_up'));
    })

    it('should switch page to registration', function(done) {
      browser.clickLink('a[href="/signup"]').then(done, done)
    })
  });

  describe('signup page', function() {
    it('should display prompt', function(done) {
      browser.visit('/signup')
      .then(function() {
        expect(browser.statusCode).to.be(200);
        expect(browser.text('title')).to.contain('Sign up');
      })
      .then(done, done);
    })

    describe('with invalid information', function () {
      it('should decline signup', function (done) {
        browser.fill('password', '1');
        browser.fill('confirmation', '1234');
        browser
        .pressButton(t('session.sign_up'))
        .then(function () {
          expect(browser.success).to.be(true);
          expect(browser.queryAll('div.form-group.has-error').length).to.be(4);
          expect(browser.text('label.help-block:nth-of-type(1)')).to.be(t('mongoose.required'));
          expect(browser.text('label.help-block:nth-of-type(2)')).to.be(t('mongoose.required'));
          expect(browser.text('label.help-block:nth-of-type(3)')).to.be(t('mongoose.short', {count: 6}));
          expect(browser.text('label.help-block:nth-of-type(4)')).to.be(t('mongoose.mismatch'));
        })
      .then(done, done);
      })
    })

    describe('with valid information', function () {
      it('should accept user', function (done) {
        browser
        .fill('name', 'Some new User')
        .fill('email', 'new.user@asutp.io')
        .fill('password', '123456')
        .fill('confirmation', '123456')
        .pressButton(t('session.sign_up'))
        .then(function() {
          expect(browser.success).to.be(true);
          expect(browser.queryAll('div.form-group.has-error').length).to.be(0);
          expect(browser.location.pathname).to.be('/signin');
          expect(browser.text('h2.form-signin-heading:nth-of-type(2)')).to.be(t('flash.create.success'));
          expect(browser.text('title')).to.contain('Sign in');
        })
        .then(done, done)
      })

      describe("follow sign in", function() {
        it("should accept credentials", function(done) {
          browser
            .fill('email', 'new.user@asutp.io')
            .fill('password', 123456)
            .pressButton(t('session.sign_in'))
            .then(function() {
              expect(browser.success).to.be(true);
              expect(browser.location.pathname).to.be('/');
              expect(browser.text('title')).to.contain('Some new User');
            })
            .then(done, done);
        });

        describe("and logged user", function() {
          it("should be administrator", function(done) {
            User.findOne({email: "new.user@asutp.io"}, function(err, user) {
              browser
                .visit('#/users/' + user._id)
                .then(function() {
                  expect(browser.query("input[name='admin']:checked")).to.be(null);
                  done();
                }, done);
            });
          });
        });
      });
    })
  });
});
