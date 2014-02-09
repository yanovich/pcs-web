/* test/views/user.js -- test user pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var browser = new Browser({ site: global.url });

var User = require('../../models/user');
var attrs = { name: "Example User1", email: "user-1@example.com",
      password: 'password', confirmation: 'password' }

describe('User#show page', function(){
  var user;

  before( function (done) {
    user = new User(attrs);
    user.save(done);
  });

  beforeEach( function (done) {
    browser
    .visit('/signin')
    .then(function () {
      browser
      .fill('Email', attrs.email)
      .fill('Password', attrs.password)
      .pressButton('Sign in')
      .then(function () {
        browser.visit('/users/' + user._id.toString()).then(done, done);
      });
    });
  });

  it('should display user', function(){
    var doc = browser.document;
    expect(browser.statusCode).to.be(200);
    expect(browser.text('body')).to.contain(user.name);
    expect(browser.text('body')).to.contain(user.email);
  })
});

// vim:ts=2 sts=2 sw=2 et:
