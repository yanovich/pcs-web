/* test/support/users_spec.js -- testing user management
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("users", function() {
  describe("admin logged in", function() {
    beforeAll(function(done) {
      browser.visit(url, function() {
        browser
        .fill('input[name="email"]', admin.email)
        .fill("input[name='password']", "password")
        .pressButton("input[name='submit']", function() {
          expect(browser.url).toEqual(url + '/#/sites');
          done();
        });
      });
    });

    afterAll(function(done) {
      browser
        .pressButton('form.form-signout input[name="submit"]', function() {
        done();
      });
    });

    it("should have title with name of logged user", function() {
      expect(browser.text("title")).toEqual(admin.name + ' - asutp.io');
    });

    it("should have menu with name of logged user", function() {
      expect(browser.text("nav > ul.nav > li.dropdown > button.dropdown-toggle")).toContain(admin.name);
    });

    it("should have users link", function() {
      expect(browser.text(".tp-menu-side > li > a[href='#/users']")).toEqual("Пользователи");
    });

    describe("#users", function() {
      beforeEach(function(done) {
        browser.clickLink(".tp-menu-side > li > a[href='#/users']", function() {
          expect(browser.url).toEqual(url + '/#/users');
          done();
        });
      });

      it("should show first page with users", function(done) {
        User.find({}, "_id name email admin").sort({ name: 1 }).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          var pager = browser.queryAll("div.page > b");
          expect(pager.length).toEqual(3);

          expect(pager[0].textContent).toEqual("1");
          expect(pager[1].textContent).toEqual("25");
          expect(pager[2].textContent).toEqual("31");
          for (var idx in users) {
            var item = users[idx];
            var row = browser.queryAll("td", table[idx]);
            expect(browser.query("a[href='#/users/" + item._id + "']", row[1]).textContent).toEqual(item.name);
            expect(browser.query("span", row[2]).textContent).toEqual(item.email);
            if (item.admin) {
              expect(browser.queryAll("span", row[3]).length).toEqual(1);
              expect(browser.text("span", row[3])).toEqual("Администратор");
            } else {
              expect(browser.queryAll("span", row[3]).length).toEqual(0);
            }
          };
          done();
        });
      });

      it("should show second page with users", function(done) {
        User.find({}, "_id name email admin").sort({ name: 1 }).skip(25).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          var pager = browser.queryAll("div.page > b");
          expect(pager.length).toEqual(3);
          expect(pager[0].textContent).toEqual("1");
          expect(pager[1].textContent).toEqual("25");
          expect(pager[2].textContent).toEqual("31");

          browser.clickLink("ul.pagination > li > a[href='#/users?page=2']", function() {
            browser.wait(function() {
              return browser.queryAll("table.tp-data > tbody > tr").length === 6;
            }, function() {
              table = browser.queryAll("table.tp-data > tbody > tr")
              expect(table.length).toEqual(6);
              pager = browser.queryAll("div.page > b");
              expect(pager.length).toEqual(3);
              expect(pager[0].textContent).toEqual("26");
              expect(pager[1].textContent).toEqual("31");
              expect(pager[2].textContent).toEqual("31");
              for (var idx in users) {
                var item = users[idx];
                var row = browser.queryAll("td", table[idx]);
                expect(browser.query("a[href='#/users/" + item._id + "']", row[1]).textContent).toEqual(item.name);
                expect(browser.query("span", row[2]).textContent).toEqual(item.email);
                if (item.admin) {
                  expect(browser.queryAll("span", row[3]).length).toEqual(1);
                  expect(browser.text("span", row[3])).toEqual("Администратор");
                } else {
                  expect(browser.queryAll("span", row[3]).length).toEqual(0);
                }
              };
              done();
            });
          });
        });
      });
    });

    describe("#show", function() {
      it("should show any user data", function(done) {
        User.create({name: "aaaa", email: "aaaa@user.com", password: "password", confirmation: "password"}, function(err, newUser) {
          if (err)
            throw err;
          browser.clickLink("ul.pagination > li > a[href='#/users?page=1']", function() {
            browser.clickLink("table.tp-data > tbody > tr > td.tp-sender > a[href='#/users/" + newUser._id + "']", function() {
              expect(browser.url).toEqual(url + '/#/users/' + newUser._id);
              expect(browser.query("input[name='name']").value).toEqual(newUser.name);
              expect(browser.query("input[name='email']").value).toEqual(newUser.email);
              expect(browser.query("input[name='admin']:checked")).toBe(null);
              expect(browser.query("input[name='password']").value).toEqual("");
              expect(browser.query("input[name='confirmation']").value).toEqual("");
              expect(browser.text("form[name='userForm'] > button")).toEqual("Изменить");
              expect(browser.query("form[name='userForm'] > button:disabled")).not.toBe(null);
              User.remove(newUser, function() {
                done();
              });
            });
          });
        });
      });

      it("should show profile data", function(done) {
        browser.pressButton("nav > ul.nav > li.dropdown > button", function() {
          browser.clickLink("nav > ul.nav > li.open > ul.dropdown-menu > li > a", function() {
            expect(browser.url).toEqual(url + '/#/users/' + admin._id);
	    expect(browser.query("input[name='name']").value).toEqual(admin.name);
	    expect(browser.query("input[name='email']").value).toEqual(admin.email);
            expect(browser.query("input[name='admin']:checked:disabled")).not.toBe(null);
            expect(browser.query("input[name='password']").value).toEqual("");
            expect(browser.query("input[name='confirmation']").value).toEqual("");
            expect(browser.text("form[name='userForm'] > button")).toEqual("Изменить");
            expect(browser.query("form[name='userForm'] > button:disabled")).not.toBe(null);
            done();
          });
        });
      });
    });

    describe("#edit", function() {
      it("should allow change profile", function(done) {
        expect(browser.url).toEqual(url + '/#/users/' + admin._id);
        browser.fill("name", admin.name = "custom name");
        expect(browser.query("form[name='userForm'] > button:disabled")).toBe(null);
        browser.pressButton("form[name='userForm'] > button", function() {
          expect(browser.query("form[name='userForm'] > button:disabled")).not.toBe(null);
          browser.clickLink(".tp-menu-side > li > a[href='#/users']", function() {
            expect(browser.url).toEqual(url + '/#/users');
            var table = browser.queryAll("table.tp-data > tbody > tr");
            expect(table.length).toEqual(25);
            expect(browser.text("td > a[href='#/users/" + admin._id + "']", table[0])).toEqual("custom name");
            done();
          });
        });
      });

      it("should allow change user", function(done) {
        User.create({name: "aaaa", email: "aaaa@user.com", password: "password", confirmation: "password"}, function(err, newUser) {
          if (err)
            throw err;
          browser.reload(function() {
            var table = browser.queryAll("table.tp-data > tbody > tr");
            expect(table.length).toEqual(25);
            browser.wait(function() {
              return browser.text("table.tp-data > tbody > tr > td.tp-sender > a[href='#/users/" + newUser._id + "']") == newUser.name;
            }, function() {
              browser.clickLink("table.tp-data > tbody > tr > td.tp-sender > a[href='#/users/" + newUser._id + "']", function() {
                expect(browser.url).toEqual(url + '/#/users/' + newUser._id);
                browser.fill("name", newUser.name = "custom new name");
                expect(browser.query("input[name='admin']:checked")).toBe(null);
                browser.check("input[name='admin']");
                expect(browser.query("form[name='userForm'] > button:disabled")).toBe(null);
                browser.pressButton("form[name='userForm'] > button", function() {
                  expect(browser.query("form[name='userForm'] > button:disabled")).not.toBe(null);
                  browser.clickLink(".tp-menu-side > li > a[href='#/users']", function() {
                    expect(browser.url).toEqual(url + '/#/users');
                    var table = browser.queryAll("table.tp-data > tbody > tr");
                    expect(table.length).toEqual(25);
                    expect(browser.text("a[href='#/users/" + newUser._id + "']", table[1])).toEqual("custom new name");
                    var row = browser.queryAll("td", table[1]);
                    expect(browser.queryAll("span", row[3]).length).toEqual(1);
                    expect(browser.text("span", row[3])).toEqual("Администратор");
                    User.remove(newUser, function() {
                      done();
                    });
                  });
                });
              });
            });

          });
        });
      });
    });

    describe("#create", function() {
      it("should allow create user", function(done) {
        var table = browser.queryAll("table.tp-data > tbody > tr");
        expect(table.length).toEqual(25);
        expect(browser.query("div.tp-sidebar > ul.tp-tools-side > li > a")).not.toBe(null);
        expect(browser.text("div.tp-sidebar > ul.tp-tools-side > li > a")).toEqual("Создать");
        browser.clickLink("div.tp-sidebar > ul.tp-tools-side > li > a", function() {
          expect(browser.query("div.tp-sidebar > ul.tp-tools-side > li > a")).toBe(null);
          expect(browser.query("input[name='name']").value).toEqual("");
          expect(browser.query("input[name='email']").value).toEqual("");
          expect(browser.query("input[name='admin']")).not.toBe(null);
          expect(browser.query("input[name='password']").value).toEqual("");
          expect(browser.query("input[name='confirmation']").value).toEqual("");
          expect(browser.text("form[name='userForm'] > button")).toEqual("Сохранить");
          expect(browser.query("form[name='userForm'] > button:disabled")).not.toBe(null);
          browser.fill("email", "auto@user.com");
          browser.fill("name", "automated user");
          browser.check("admin");
          browser.fill("password", "password");
          browser.fill("confirmation", "password");
          browser.fill("email", "auto@user.com");
          expect(browser.query("input[name='name']").value).toEqual("automated user");
          expect(browser.query("input[name='email']").value).toEqual("auto@user.com");
          expect(browser.query("form[name='userForm'] > button:disabled")).toBe(null);
          browser.pressButton("form[name='userForm'] > button", function() {
            browser.wait(function(window) {
              return window.document.querySelector("form[name='userForm'] > button:disabled");
            }, function() {
              browser.clickLink(".tp-menu-side > li > a[href='#/users']", function() {
                var table = browser.queryAll("table.tp-data > tbody > tr");
                expect(table.length).toEqual(25);
                var row = browser.queryAll("td", table[0]);
                expect(browser.query("a", row[1]).textContent).toEqual("automated user");
                expect(browser.query("span", row[2]).textContent).toEqual("auto@user.com");
                expect(browser.queryAll("span", row[3]).length).toEqual(1);
                expect(browser.text("span", row[3])).toEqual("Администратор");
                done();
              });
            });
          });
        });
      });
    });
  });
});

