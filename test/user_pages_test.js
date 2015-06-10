/* test/user_pages_test.js -- test user pages, run it with mocha
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

var User = require('../models/user');
var attrs = {}

describe('User', function(){
  var user;

  before(function (done) {
    Factory.create('user', 26, function (users) {
      user = users[0];
      done();
    });
  });

  describe('profile page', function () {
    before(function (done) {
      browser = new Browser({ site: global.url });
      browser
      .visit('/signin')
      .then(function () {
        browser
        .fill(t('user.email'), user.email)
        .fill(t('user.password'), user.password)
        .pressButton(t('session.sign_in'))
        .then(function () {
          browser.pressButton('nav button.dropdown-toggle').then(function () {
            browser.clickLink('nav ul.dropdown-menu a').then(done, done);
          }, done);
        }, done);
      }, done);
    })

    it('should display user', function () {
      expect(browser.url).to.eql(url + '/#/users/' + user._id);
      expect(browser.query("input[name='name']").value).to.eql(user.name);
      expect(browser.query("input[name='email']").value).to.eql(user.email);
      expect(browser.query("input[name='admin']:disabled")).not.to.be(null);
      expect(browser.query("input[name='admin']:checked:disabled")).to.be(null);
      expect(browser.query("input[name='password']").value).to.eql("");
      expect(browser.query("input[name='confirmation']").value).to.eql("");
      expect(browser.text("form[name='userForm'] > button")).to.eql("Изменить");
      expect(browser.query("form[name='userForm'] > button:disabled")).not.to.be(null);
    })

    describe('edit with valid data', function () {
      beforeEach(function (done) {
        user.name = 'Update Name';
        user.password = 'newPassword';
        user.confirmation = 'newPassword';
        browser
        .fill(t('user.name'), user.name)
        .fill(t('user.password'), user.password)
        .fill(t('user.confirmation'), user.confirmation)
        .pressButton(t('action.put'))
        .then(done, done)
      })

      it('should show updated data', function (done) {
        expect(browser.query("input[name='name']").value).to.eql(user.name);
        expect(browser.query("input[name='email']").value).to.eql(user.email);
        User.findById(user._id, function (err, u) {
          expect(u.name).to.be(user.name);
          expect(u.email).to.be(user.email);
          u.authenticate(user.password, function (err, valid) {
            expect(valid).to.be(true);
            done();
          });
        });
      })
    })

    describe('edit with invalid data', function () {
      it('should display errors')
    })
  })

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

    describe('index page', function () {
      beforeEach(function (done) {
        browser.clickLink(".tp-menu-side > li > a[href='#/users']", done);
      })

      it('should list users with pagination', function (done) {
        expect(browser.url).to.be(url + '/#/users');
        var pager = browser.queryAll("div.page > b");
        expect(pager.length).to.be(3);
        expect(pager[0].textContent).to.be("1");
        expect(pager[1].textContent).to.be("25");

        var table = browser.queryAll('table.tp-data tr');
        expect(table.length).to.be(25);

        User.count(function (err, count) {
          expect(pager[2].textContent).to.eql(count);
          User.find().sort({ name: 1 }).limit(25).exec(function (err, users) {
            var i;
            for (i in users) {
              var u = users[i];
              var row = browser.queryAll("td", table[i]);
              expect(browser.query("a[href='#/users/" + u._id + "']", row[1]).textContent).to.be(u.name);
              expect(browser.query("span", row[2]).textContent).to.be(u.email);
              if (u.admin) {
                expect(browser.queryAll("span", row[3]).length).to.be(1);
                expect(browser.text("span", row[3])).to.be("Администратор");
              } else {
                expect(browser.queryAll("span", row[3]).length).to.be(0);
              }
            }
            done();
          })
        })
      })
    })

    describe('bad profile page', function () {
      it('should report error')
    })

    describe('user page', function () {
      before(function (done) {
        browser.location = '#/users/' + user._id;
        browser.wait(function () {
          done();
        });
      })

      it('should render user profile', function () {
        expect(browser.query("input[name='name']").value).to.eql(user.name);
        expect(browser.query("input[name='email']").value).to.eql(user.email);
        expect(browser.query("input[name='admin']")).not.to.be(null);
        expect(browser.query("input[name='admin']:checked")).to.be(null);
        expect(browser.query("input[name='password']").value).to.eql("");
        expect(browser.query("input[name='confirmation']").value).to.eql("");
        expect(browser.text("form[name='userForm'] > button")).to.eql("Изменить");
        expect(browser.query("form[name='userForm'] > button:disabled")).not.to.be(null);
      })

      describe('changing name attribute', function () {
        it('should update user', function (done) {
          browser.fill("name", user.name + '!');
          expect(browser.query("form[name='userForm'] > button:disabled")).to.be(null);
          browser.pressButton(t('action.put')).then(function () {
            User.findById(user._id, function (err, u) {
              expect(u.name).to.be(user.name + '!');
              done();
            });
          }, done);
        })
      })

      describe('admin attribute', function () {
        beforeEach(function (done) {
          browser
          .check(t('user.admin'))
          .pressButton(t('action.put'))
          .then(function () {
            done();
          }, done);
        })

        it('should assign admin', function (done) {
          User.findById(user._id, function (err, u) {
            expect(u.admin).to.be(true);
            done();
          });
        })
      })
    })

    describe('new users', function () {
      beforeEach(function (done) {
        browser.location = '#/users/new';
        browser.wait(done);
      })

      it('should index provide input form', function () {
        expect(browser.url).to.be(url + '/#/users/new');
      })

      describe('with invalid data', function () {
        it("should show required error if empty name", function() {
          var requireMessageSelector = 'div label[for="name"][ng-show="userForm.name.$error.required"]';
          expect(browser.queryAll('div.form-group.has-error').length).to.eql(0);
          expect(browser.window.getComputedStyle(browser.query(requireMessageSelector).parentNode).display).to.be("none");
          browser.fill(t('user.name'), "Some name");
          expect(browser.queryAll('div.form-group.has-error').length).to.eql(0);
          browser.query('input[name="email"]').focus();
          expect(browser.window.getComputedStyle(browser.query(requireMessageSelector).parentNode).display).to.be("none");
          browser.fill(t('user.name'), "");
          expect(browser.queryAll('div.has-error').length).to.eql(1);
          expect(browser.window.getComputedStyle(browser.query(requireMessageSelector).parentNode).display).to.be("");
          expect(browser.window.getComputedStyle(browser.query(requireMessageSelector)).display).to.be("");
          expect(browser.text('div label[for="name"][ng-show="userForm.name.$error.required"]'))
            .to.eql("Это поле обязательно для заполнения");
        });
      });

      describe('with valid data', function () {
        var newUser = new User();
        before(function (done) {
          newUser.name = 'New Name';
          newUser.email = 'new@example.com';
          newUser.password = 'newPassword';
          newUser.confirmation = 'newPassword';
          browser
          .fill(t('user.name'), newUser.name)
          .fill(t('user.email'), newUser.email)
          .fill(t('user.password'), newUser.password)
          .fill(t('user.confirmation'), newUser.confirmation)
          .pressButton(t('action.undefined'))
          .then(done, done)
        })

        it('should create user', function (done) {
          User.findOne({ email: newUser.email }, function (err, u) {
            expect(u.name).to.be(newUser.name);
            expect(u.email).to.be(newUser.email);
            u.authenticate(newUser.password, function (err, valid) {
              expect(valid).to.be(true);
              done();
            });
          });
        })

        it('should show created user');
      })
    })
  })
});

// vim:ts=2 sts=2 sw=2 et:
