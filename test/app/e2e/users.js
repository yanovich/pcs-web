var User = require('../../../models/user');


describe("users", function() {
  beforeEach(function(done) {
    browser.driver.get('http://localhost:' + browser.params.port + '/signin');

    browser.driver.findElement(by.id('email')).sendKeys('sg@gmail.com');
    browser.driver.findElement(by.id('password')).sendKeys('password');
    browser.driver.findElement(by.name('submit')).click();

    // Login takes some time, so wait until it's done.
    // For the test app's login, we know it's done when it redirects to
    // index.html.
    browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return /sites/.test(url);
      });
    }).then(function() {
      done();
    });
  });

  afterEach(function(done) {
    element(by.css("form.form-signout")).submit().then(function() {
      browser.driver.wait(function() {
        return browser.driver.getCurrentUrl().then(function(url) {
          return /signin/.test(url);
        });
      }).then(function() {
        done();
      });
    });
  });

  it("should have title with name of logged user", function(done) {
    browser.get('http://localhost:' + browser.params.port + '/');
    expect(browser.getTitle()).toEqual(browser.params.user.name + ' - asutp.io');
    done();
  });

  it("should have menu with name of logged user", function() {
    browser.get('http://localhost:' + browser.params.port + '/');
    element(by.css("nav > ul.nav > li.dropdown > button.dropdown-toggle")).getInnerHtml().then(function(html) {
      expect(html).toContain(browser.params.user.name);
    });
  });

  it("should have users link", function() {
    browser.get('http://localhost:' + browser.params.port + '/');
    element(by.css(".tp-menu-side > li > a[href='#/users']")).getText().then(function(link) {
      expect(link).toEqual("Пользователи");
    });
  });

  describe("#users", function() {
    function createMultipleUsers(count, next) {
      var user = {
        name: "user#" + count,
        email: "email" + count + "@example.com",
        password: "password",
        confirmation: "password",
      };
      (new User(user)).save(function(err) {
        if (err)
          throw "Error";
        count -= 1;
        if (count > 0) {
          createMultipleUsers(count, next);
        } else {
          next();
        }
      });
    }


    beforeEach(function(done) {
      createMultipleUsers(30, function() {
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /users/.test(url);
            });
          }).then(function() {
            done();
          });
        });
      });
    });

    afterEach(function(done) {
      User.remove({}, function(err) {
        var user = {
          name: "sg",
          email: "sg@gmail.com",
          password: "password",
          confirmation: "password",
          admin: true
        };
        User.create(user, function(err, user) {
          browser.params.user._id = user._id;
          User.count(function(err, cnt) {
            done();
          });
        });
      });
    });

    it("should show first page with users", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(25);
      var pager = $$("div.page > b");
      expect(pager.count()).toEqual(3);
      expect(pager.get(0).getText()).toEqual("1");
      expect(pager.get(1).getText()).toEqual("25");
      expect(pager.get(2).getText()).toEqual("31");
      User.find({}, "_id name email admin").sort({ name: 1 }).limit(25).exec(function(err, users) {
        if (err)
          throw err;
        for (var idx in users) {
          var item = users[idx];
          var row = table.get(idx).all(by.css("td"));
          expect(row.get(1).element(by.css("a[href='#/users/" + item._id + "']")).getText()).toEqual(item.name);
          expect(row.get(2).element(by.css("span")).getText()).toEqual(item.email);
          if (item.admin) {
            expect(row.get(3).all(by.css("span")).count()).toEqual(1);
            expect(row.get(3).element(by.css("span")).getText()).toEqual("Администратор");
          } else {
            expect(row.get(3).all(by.css("span")).count()).toEqual(0);
          }
        };
        done();
      });
    });

    it("should show second page with users", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(25);
      var pager = $$("div.page > b");
      expect(pager.count()).toEqual(3);
      expect(pager.get(0).getText()).toEqual("1");
      expect(pager.get(1).getText()).toEqual("25");
      expect(pager.get(2).getText()).toEqual("31");
      $$("ul.pagination > li > a").get(1).click();

      browser.wait(function() {
        return $$("table.tp-data > tbody > tr").count().then(function(cnt) {
          return cnt == 6;
        });
      }).then(function() {
        User.find({}, "_id name email admin").sort({ name: 1 }).skip(25).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          for (var idx in users) {
            var item = users[idx];
            var row = table.get(idx).all(by.css("td"));
            expect(row.get(1).element(by.css("a[href='#/users/" + item._id + "']")).getText()).toEqual(item.name);
            expect(row.get(2).element(by.css("span")).getText()).toEqual(item.email);
            if (item.admin) {
              expect(row.get(3).all(by.css("span")).count()).toEqual(1);
              expect(row.get(3).element(by.css("span")).getText()).toEqual("Администратор");
            } else {
              expect(row.get(3).all(by.css("span")).count()).toEqual(0);
            }
          };
          done();
        });
      });
    });
  });

  describe("#show", function() {
    it("should show any user data", function(done) {
      User.create({name: "us", email: "user@user.com", password: "password", confirmation: "password"}, function(err, user) {
        if (err)
          throw err;
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /users/.test(url);
            });
          }).then(function() {
            var table = $$("table.tp-data > tbody > tr");
            expect(table.count()).toEqual(2);

            element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/users/" + user._id + "']")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('users\/' + user._id + '').test(url);
                });
              }).then(function() {
                expect(element(by.name("name")).getAttribute("value")).toEqual(user.name);
                expect(element(by.name("email")).getAttribute("value")).toEqual(user.email);
                expect(element(by.name("admin")).getAttribute("checked")).toBeFalsy();
                expect(element(by.name("password")).getAttribute("value")).toEqual("");
                expect(element(by.name("confirmation")).getAttribute("value")).toEqual("");
                expect(element(by.name("userForm")).element(by.css("button")).getText()).toEqual("Изменить");
                expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                User.remove(user, function() {
                  done();
                });
              });
            });
          });
        });
      });
    });

    it("should show profile data", function(done) {
      browser.get('http://localhost:' + browser.params.port + '/');
      browser.driver.wait(function() {
        return element(by.css("nav > ul.nav > li.dropdown > button")).isDisplayed().then(function(visible) {
          return visible == true;
        });
      }).then(function() {
        element(by.css("nav > ul.nav > li.dropdown > button")).click().then(function() {
          browser.driver.wait(function() {
            return element(by.css("nav > ul.nav > li.dropdown > ul.dropdown-menu > li > a[href='#/users/" + browser.params.user._id + "']")).isDisplayed().then(function(visible) {
              return visible == true;
            });
          }).then(function() {
            element(by.css("nav > ul.nav > li.open > ul.dropdown-menu > li > a")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('users\/' + browser.params.user._id + '').test(url);
                });
              });
              expect(element(by.name("name")).getAttribute("value")).toEqual(browser.params.user.name);
              expect(element(by.name("email")).getAttribute("value")).toEqual(browser.params.user.email);
              expect(element(by.name("admin")).getAttribute("checked")).toBeTruthy();
              expect(element(by.name("password")).getAttribute("value")).toEqual("");
              expect(element(by.name("confirmation")).getAttribute("value")).toEqual("");
              expect(element(by.name("userForm")).element(by.css("button")).getText()).toEqual("Изменить");
              expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
              done();
            });
          });
        });
      });
    });
  });

  describe("#edit", function() {
    it("should allow change profile", function(done) {
      browser.get('http://localhost:' + browser.params.port + '/');
      browser.driver.wait(function() {
        return element(by.css("nav > ul.nav > li.dropdown > button")).isDisplayed().then(function(visible) {
          return visible == true;
        });
      }).then(function() {
        element(by.css("nav > ul.nav > li.dropdown > button")).click().then(function() {
          browser.driver.wait(function() {
            return element(by.css("nav > ul.nav > li.dropdown > ul.dropdown-menu > li > a[href='#/users/" + browser.params.user._id + "']")).isDisplayed().then(function(visible) {
              return visible == true;
            });
          });
          element(by.css("nav > ul.nav > li.open > ul.dropdown-menu > li > a")).click().then(function() {
            browser.driver.wait(function() {
              return browser.driver.getCurrentUrl().then(function(url) {
                return new RegExp('users\/' + browser.params.user._id + '').test(url);
              });
            }).then(function() {
              expect(element(by.name("name")).getAttribute("value")).toEqual(browser.params.user.name);
              expect(element(by.name("email")).getAttribute("value")).toEqual(browser.params.user.email);
              expect(element(by.name("admin")).getAttribute("checked")).toBeTruthy();
              expect(element(by.name("password")).getAttribute("value")).toEqual("");
              expect(element(by.name("confirmation")).getAttribute("value")).toEqual("");
              expect(element(by.name("userForm")).element(by.css("button")).getText()).toEqual("Изменить");
              expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
              element(by.name("name")).clear();
              element(by.name("name")).sendKeys(browser.params.user.name = "custom name");
              expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeTruthy();
              element(by.name("userForm")).element(by.css("button")).click().then(function() {
                expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
                  var table = $$("table.tp-data > tbody > tr");
                  expect(table.count()).toEqual(1);
                  var row = table.get(0).all(by.css("td"));
                  expect(row.get(1).element(by.css("a[href='#/users/" + browser.params.user._id + "']")).getText()).toEqual("custom name");
                  done();
                });
              });
            });
          });
        });
      });
    });

    it("should allow change user", function(done) {
      User.create({name: "us", email: "user@user.com", password: "password", confirmation: "password"}, function(err, user) {
        if (err)
          throw err;
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /users/.test(url);
            });
          }).then(function() {
            var table = $$("table.tp-data > tbody > tr");
            expect(table.count()).toEqual(2);

            element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/users/" + user._id + "']")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('users\/' + user._id + '').test(url);
                });
              }).then(function() {
                expect(element(by.name("name")).getAttribute("value")).toEqual(user.name);
                expect(element(by.name("email")).getAttribute("value")).toEqual(user.email);
                expect(element(by.name("admin")).getAttribute("checked")).toBeFalsy();
                expect(element(by.name("password")).getAttribute("value")).toEqual("");
                expect(element(by.name("confirmation")).getAttribute("value")).toEqual("");
                expect(element(by.name("userForm")).element(by.css("button")).getText()).toEqual("Изменить");
                expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.name("name")).clear();
                element(by.name("name")).sendKeys(browser.params.user.name = "custom name");
                element(by.name("admin")).click().then(function() {
                  expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeTruthy();
                  element(by.name("userForm")).element(by.css("button")).click().then(function() {
                    expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                    element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
                      var table = $$("table.tp-data > tbody > tr");
                      expect(table.count()).toEqual(2);
                      var row = table.get(0).all(by.css("td"));
                      expect(row.get(1).element(by.css("a[href='#/users/" + browser.params.user._id + "']")).getText()).toEqual("custom name");
                      expect(row.get(3).all(by.css("span")).count()).toEqual(1);
                      expect(row.get(3).element(by.css("span")).getText()).toEqual("Администратор");
                      User.remove(user, function() {
                        done();
                      });
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
  });

  describe("#create", function() {
    it("should allow create user", function(done) {
      browser.get('http://localhost:' + browser.params.port + '/');
      element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return /users/.test(url);
          });
        }).then(function() {
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeTruthy();
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).getText()).toEqual("СОЗДАТЬ");
          element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).click().then(function() {
            browser.driver.wait(function() {
              return browser.driver.getCurrentUrl().then(function(url) {
                return /users\/new/.test(url);
              });
            }).then(function() {
              expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeFalsy();
              expect(element(by.name("name")).getAttribute("value")).toEqual("");
              expect(element(by.name("email")).getAttribute("value")).toEqual("");
              expect(element(by.name("admin")).getAttribute("checked")).toBeFalsy();
              expect(element(by.name("password")).getAttribute("value")).toEqual("");
              expect(element(by.name("confirmation")).getAttribute("value")).toEqual("");
              expect(element(by.name("userForm")).element(by.css("button")).getText()).toEqual("Сохранить");
              expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
              element(by.name("name")).sendKeys("automated user");
              element(by.name("email")).sendKeys("auto@user.com");
              element(by.name("password")).sendKeys("password");
              element(by.name("confirmation")).sendKeys("password");
              element(by.name("admin")).click();
              expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeTruthy();
              element(by.name("userForm")).element(by.css("button")).click().then(function() {
                expect(element(by.name("userForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.css(".tp-menu-side > li > a[href='#/users']")).click().then(function() {
                  var table = $$("table.tp-data > tbody > tr");
                  expect(table.count()).toEqual(3);
                  var row = table.get(0).all(by.css("td"));
                  expect(row.get(1).element(by.css("a")).getText()).toEqual("automated user");
                  expect(row.get(2).element(by.css("span")).getText()).toEqual("auto@user.com");
                  expect(row.get(3).all(by.css("span")).count()).toEqual(1);
                  expect(row.get(3).element(by.css("span")).getText()).toEqual("Администратор");
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


