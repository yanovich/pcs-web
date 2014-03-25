/* test/views/user.js -- test user pages, run it with mocha
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
var attrs = { name: 'Example User1"', email: "user-1@example.com",
      password: 'password', confirmation: 'password' }

describe('User', function(){
  var user;
  var hash;

  beforeEach(function () {
    browser = new Browser({ site: global.url });
  })

  before(function () {
    user = new User(attrs);
    user.save(function () {
      hash = user.hash;
    });
  });

  describe('profile page', function () {
    beforeEach(function (done) {
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), attrs.email)
        .fill(t('user.password'), attrs.password)
        .pressButton(t('session.sign_in'))
        .then(function () {
          browser.visit('/users/' + user._id.toString()).then(done, done);
        }, done);
      }, done);
    })

    it('should display user', function () {
      expect(browser.statusCode).to.be(200);
      expect(browser.query("input[value='"+user.name+"']")).not.to.be(undefined);
      expect(browser.query('input[value="'+user.email+'"]')).not.to.be(undefined);
    })

    describe('edit with valid data', function () {
      before(function (done) {
        attrs.name = 'New Name';
        attrs.email = 'new@example.com';
        browser
        .fill(t('user.name'), attrs.name)
        .fill(t('user.email'), attrs.email)
        .pressButton(t('user.update'))
        .then(done, done)
      })

      it('should show updated data', function (done) {
        expect(browser.statusCode).to.be(200);
        expect(browser.query("input[value='"+attrs.name+"']")).not.to.be(undefined);
        expect(browser.query('input[value="'+attrs.email+'"]')).not.to.be(undefined);
        User.findById(user._id, function (err, user) {
          user.name.should.equal(attrs.name);
          user.email.should.equal(attrs.email);
          user.hash.should.equal(hash);
          done();
        });
      })
    })

    describe('edit with invalid data', function () {
      beforeEach(function (done) {
        browser
        .fill(t('user.name'), '')
        .fill(t('user.email'), '')
        .pressButton(t('user.update'))
        .then(done, done);
      })

      it('should display errors', function () {
        expect(browser.statusCode).to.be(200);
        expect(browser.query('.has-error label.help-block[for="name"]')).not.to.be(undefined);
        expect(browser.query('.has-error label.help-block[for="email"]')).not.to.be(undefined);
      })
    })
  })
});

// vim:ts=2 sts=2 sw=2 et:
