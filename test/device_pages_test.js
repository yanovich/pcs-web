/* test/device_pages_test.js -- test device pages, run it with mocha
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

describe('Device', function(){
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

    describe('new devices', function () {
      beforeEach(function (done) {
        browser.location = '#/devices/new';
        browser.wait(done);
      });

      describe('with invalid data', function () {
        describe("for name field", function() {
          it("should show required error if empty name", function() {
            var required = 'div label[for="name"][ng-show="deviceForm.name.$error.required"]';
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
            expect(browser.text('div label[for="name"][ng-show="deviceForm.name.$error.required"]'))
              .to.eql("Это поле обязательно для заполнения");
          });

          it("should show maxlength error if name length riched 50 symbols", function() {
            var maxLength = 'div label[for="name"][ng-show="deviceForm.name.$error.maxlength"]';
            expect(browser.queryAll('div.form-group.has-error').length).to.eql(0);
            expect(browser.window.getComputedStyle(browser.query(maxLength).parentNode).display).to.be("none");
            browser.fill('Название', "Some name");
            expect(browser.queryAll('div.form-group.has-error').length).to.eql(0);
            browser.query('button').focus();
            expect(browser.window.getComputedStyle(browser.query(maxLength).parentNode).display).to.be("none");
            browser.fill('Название', Array(52).join("a"));
            expect(browser.queryAll('div.has-error').length).to.eql(1);
            expect(browser.window.getComputedStyle(browser.query(maxLength).parentNode).display).to.be("");
            expect(browser.window.getComputedStyle(browser.query(maxLength)).display).to.be("");
            expect(browser.text(maxLength)).to.eql("Это поле содержит больше 50-ти символов");
          });
        });
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
