/* test/views/session.js -- test session pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var request = require('supertest');
var Browser = require('zombie');

var server = request(global.url);
var browser = new Browser({ site: global.url });

var User = require('../../models/user');
var attrs = { name: "Example User2", email: "user-2@example.com",
      password: 'password', confirmation: 'password' }

describe('signin page', function() {
  var user;

  before( function (done) {
    user = new User(attrs);
    user.save(done);
  });

  it('should display prompt', function(done) {
    server
      .get('/signin')
      .expect(200)
      .expect(new RegExp('Sign in'))
      .end(done);
  })

  describe('with invalid information', function () {
    it('should decline signin', function (done) {
      browser
        .visit('/signin')
        .then(function () {
          browser.pressButton('Sign in')
            .then(function () {
              expect(browser.success).to.be(true);
              expect(browser.queryAll('div.form-group.has-error').length).to.be(1);
              expect(browser.text('label.help-block')).to.be('Wrong email or password');
            })
            .then(done, done);
        })
    })
  })

  describe('with valid information', function () {
    it('should accept user', function (done) {
      browser
        .visit('/signin')
        .then(function () {
          browser.fill('Email', attrs.email);
          browser.fill('Password', attrs.password);
          browser.pressButton('Sign in')
            .then(function () {
              expect(browser.success).to.be(true);
              expect(browser.queryAll('div.form-group.has-error').length).to.be(0);
              expect(browser.location.pathname).to.be('/');
              expect(browser.text('title')).to.contain(attrs.name);
            })
            .then(done, done);
        })
    })
  })
});

// vim:ts=2 sts=2 sw=2 et:
