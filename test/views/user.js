/* test/views/user.js -- test user pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var browser = new Browser({ site: global.url });
function t(key, options) {
  return global.i18n.t(key, options);
}

var User = require('../../models/user');
var attrs = { name: "Example User1", email: "user-1@example.com",
      password: 'password', confirmation: 'password' }
var attrs2 = { name: "a>bc",  email: "user-escape@example.com",
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
      .fill(t('user.email'), attrs.email)
      .fill(t('user.password'), attrs.password)
      .pressButton(t('session.sign_in'))
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


describe('HTML escaping of user input', function(){
  var user;

  before( function (done) {
    user = new User(attrs2);
    user.save(done);
  });

  beforeEach( function (done) {
    browser
    .pressButton(t('session.sign_out'))
    .then(function () {
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), attrs.email)
        .fill(t('user.password'), attrs.password)
        .pressButton(t('session.sign_in'))
        .then(function () {
          browser.visit('/users/' + user._id.toString()).then(done, done);
        });
      });
    });
  });

  it('should display user', function(){
    var doc = browser.document;
    expect(browser.statusCode).to.be(200);
    expect(browser.text('.tp-content > li')).to.contain(user.name);
  })
});
// vim:ts=2 sts=2 sw=2 et:
