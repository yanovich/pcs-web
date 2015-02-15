/* test/device_registration_pages_test.js -- test registration pages, run it with mocha
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Browser = require('zombie');

var saBrowser;
function t(key, options) {
  return global.i18n.t(key, options);
}

var config = require('../config');

describe('Registartion of device', function () {
  before( function () {
    saBrowser = new Browser({ site: global.url });
  });

  describe('superadmin assign right to create device', function() {
    it('should signin', function (done) {
      saBrowser.visit('/signin').then(function() {
        saBrowser
          .fill(t('user.email'), config.saEmail)
          .fill(t('user.password'), "0987654321")
          .pressButton(t('session.sign_in'))
          .then(function() {
            expect(saBrowser.success).to.be(true);
            expect(saBrowser.queryAll('div.form-group.has-error').length).to.be(0);
            expect(saBrowser.location.pathname).to.be('/');
            expect(saBrowser.text('title')).to.contain(t("user.root"));
            done();
        });
      });
    });

    it("should signout", function() {
      saBrowser
        .pressButton(t('session.sign_out'))
        .then(function() {
          expect(saBrowser.location.pathname).to.be('/signin');
          expect(saBrowser.text('title')).to.contain('Sign in');
        });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
