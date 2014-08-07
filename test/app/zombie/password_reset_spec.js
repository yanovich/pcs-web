'use strict'
/* test/support/password_reset_spec.js -- testing password reset
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("reset password", function() {
  beforeAll(function(done) {
    browser.visit(url, done);
  });

  afterAll(function(done) {
    browser
    .pressButton('form.form-signout input[name="submit"]', function() {
      done();
    });
  });

  it("should have sites link", function() {
    expect(browser.text("a[href='/forgot']")).toEqual("Забыли пароль?");
  });

  describe("reset", function() {
    beforeAll(function(done) {
      browser.clickLink("a[href='/forgot']", done);
    });

    it("should show error", function(done) {
      expect(browser.query("input[name='email']").value).toEqual("");
      expect(browser.query("input[name='submit']").value).toEqual("Сбросить пароль");
      browser.fill("email", "aaa");
      browser.pressButton("submit", function() {
        expect(browser.text("label.help-block")).toEqual("Не найдено");
        expect(browser.query("input[name='email']").value).toEqual("");
        done();
      });
    });

    it("should be ok", function(done) {
      expect(browser.query("input[name='email']").value).toEqual("");
      expect(browser.query("input[name='submit']").value).toEqual("Сбросить пароль");
      browser.fill("email", admin.email);
      browser.pressButton("submit", function() {
        expect(browser.text("h2.form-signin-heading")).toEqual("Письмо с инструкциями было отправлено на адресс - " + admin.email);
        expect(browser.query("input[name='email']").value).toEqual("");
        done();
      });
    });
  });

  describe("set new password", function() {
    beforeAll(function(done) {
      User.findOne({_id: admin._id}, function(err, newUser) {
        if(err) throw err;
        admin = newUser;
        browser.visit(url + "/reset/" + admin.resetPasswordToken, done);
      });
    });

    it("should redirect", function(done) {
      expect(browser.query("input[name='password']").value).toEqual("");
      expect(browser.query("input[name='confirmation']").value).toEqual("");
      expect(browser.query("input[name='submit']").value).toEqual("Обновить пароль");
      browser.fill("password", "newPassword");
      browser.fill("confirmation", "newPassword");
      browser.pressButton("submit", function() {
        expect(browser.location.href).toEqual(url + '/signin');
        browser.fill('input[name="email"]', admin.email);
        browser.fill("input[name='password']", "newPassword");
        browser.pressButton("input[name='submit']", function() {
          expect(browser.url).toEqual(url + '/#/sites');
          admin.resetPassword("password", "password", done);
        });
      });
    });
  });
});

