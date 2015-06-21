/* test/site_pages_test.js -- test site pages, run it with mocha
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

describe('Site', function(){
  describe('administration of', function () {
    var admin;
    before(function (done) {
      Factory.create('admin', function (a) { admin = a; done(); });
    })

    before(function (done) {
      browser = new Browser({ site: global.url });
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), admin.email)
        .fill(t('user.password'), admin.password)
        .pressButton(t('session.sign_in'))
        .then(function () {
          done();
        }, done);
      }, done);
    })

    describe('new sites', function () {
      beforeEach(function (done) {
        browser.location = '#/sites/new';
        browser.wait(done);
      });

      describe('with invalid data', function () {
        describe("for name field", function() {
          it("should show required error if empty name", function() {
            var required = 'div label[for="name"][ng-show="siteForm.name.$error.required"]';
            expect(browser.queryAll('div.form-group.has-error').length).to.eql(0);
            expect(browser.window.getComputedStyle(browser.query(required).parentNode).display).to.be("none");
            browser.fill('Название', "Some name");
            expect(browser.queryAll('div.form-group.has-error').length).to.eql(0);
            browser.query('button').focus();
            expect(browser.window.getComputedStyle(browser.query(required).parentNode).display).to.be("none");
            browser.fill('Название', "");
            expect(browser.queryAll('div.has-error').length).to.eql(1);
            expect(browser.window.getComputedStyle(browser.query(required).parentNode).display).to.be("");
            expect(browser.window.getComputedStyle(browser.query(required)).display).to.be("");
            expect(browser.text('div label[for="name"][ng-show="siteForm.name.$error.required"]'))
              .to.eql("Это поле обязательно для заполнения");
          });
        });
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
