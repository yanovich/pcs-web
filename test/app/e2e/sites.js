var Device = require('../../../models/device');
var System = require('../../../models/system');
var Site = require('../../../models/site');
var State = require('../../../models/state');


describe("sites", function() {
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
      Site.remove(function() {
        Device.remove(function() {
          System.remove(done);
        });
      });
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

  it("should have sites link", function() {
    browser.get('http://localhost:' + browser.params.port + '/');
    element(by.css(".tp-menu-side > li > a[href='#/sites']")).getText().then(function(link) {
      expect(link).toEqual("Объекты");
    });
  });

  describe("#sites", function() {
    function createMultipleSites(count, next) {
      var site = {
        name: "site#" + count,
      };
      (new Site(site)).save(function(err) {
        if (err)
          throw "Error";
        count -= 1;
        if (count > 0) {
          createMultipleSites(count, next);
        } else {
          next();
        }
      });
    }


    beforeEach(function(done) {
      createMultipleSites(30, function() {
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /sites/.test(url);
            });
          }).then(function() {
            done();
          });
        });
      });
    });

    afterEach(function(done) {
      Site.remove(function(err) {
        if(err) console.error(err);
        done();
      });
    });

    it("should show first page with sites", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(25);
      var pager = $$("div.page > b");
      expect(pager.count()).toEqual(3);
      expect(pager.get(0).getText()).toEqual("1");
      expect(pager.get(1).getText()).toEqual("25");
      expect(pager.get(2).getText()).toEqual("30");
      Site.find({}, "_id name").sort({ name: 1 }).limit(25).exec(function(err, sites) {
        if (err)
          throw err;
        for (var idx in sites) {
          var item = sites[idx];
          var row = table.get(idx).all(by.css("td"));
          expect(row.get(2).element(by.css("a[href='#/sites/" + item._id + "']")).getText()).toEqual(item.name);
        };
        done();
      });
    });

    it("should show second page with sites", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(25);
      var pager = $$("div.page > b");
      expect(pager.count()).toEqual(3);
      expect(pager.get(0).getText()).toEqual("1");
      expect(pager.get(1).getText()).toEqual("25");
      expect(pager.get(2).getText()).toEqual("30");
      $$("ul.pagination > li > a").get(1).click();

      browser.wait(function() {
        return $$("table.tp-data > tbody > tr").count().then(function(cnt) {
          return cnt == 5;
        });
      }).then(function() {
        Site.find({}, "_id name").sort({ name: 1 }).skip(25).limit(25).exec(function(err, sites) {
          if (err)
            throw err;
          for (var idx in sites) {
            var item = sites[idx];
            var row = table.get(idx).all(by.css("td"));
            expect(row.get(2).element(by.css("a[href='#/sites/" + item._id + "']")).getText()).toEqual(item.name);
          };
          done();
        });
      });
    });
  });

  describe("#show", function() {
    var site = null, systems = [];
    beforeEach(function(done) {
      systems = [];
      Site.create({name: "site"}, function(err, st) {
        if (err)
          throw err;
        site = st;
        Device.create({name: "dev1"}, function(err, dev) {
          if (err) throw err;
          System.create({name: "system1", site: site._id, device: dev._id, setpoints: { m1: 1000, m2: "hello" }}, function(err, system) {
            if (err) throw err;
            systems.push(system);
            Device.create({name: "dev2"}, function(err, dev) {
              if (err) throw err;
              System.create({name: "system2", site: site._id, device: dev._id, setpoints: { m4: "d", m3: "b" }}, function(err, system) {
                if (err) throw err;
                systems.push(system);
                browser.get('http://localhost:' + browser.params.port + '/');
                element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
                  browser.driver.wait(function() {
                    return browser.driver.getCurrentUrl().then(function(url) {
                      return /sites/.test(url);
                    });
                  }).then(function() {
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    afterEach(function(done) {
      Site.remove(function() {
        Device.remove(function() {
          System.remove(function() {
            done();
          });
        });
      });
    });

    it("should show site name in input field", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(1);

      element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/sites/" + site._id + "']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return new RegExp('sites\/' + site._id + '').test(url);
          });
        }).then(function() {
          expect(element(by.name("name")).getAttribute("value")).toEqual(site.name);
          expect(element(by.name("siteForm")).element(by.css("button")).getText()).toEqual("Изменить");
          expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeFalsy();
          done();
        });
      });
    });

    it("should show systems", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(1);

      element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/sites/" + site._id + "']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return new RegExp('sites\/' + site._id + '').test(url);
          });
        }).then(function() {
          table = $$("table.tp-data > tbody > tr");
          expect(table.count()).toEqual(2);
          for (var i = 0; i < systems.length; ++ i) {
            expect(element(by.css("table.tp-data a[href='#/sites/" + site._id + "/systems/" + systems[i]._id + "']")).getText()).toEqual(systems[i].name);
          }
          done();
        });
      });
    });
  });

  describe("#edit", function() {
    it("should allow change site", function(done) {
      Site.create({name: "dev"}, function(err, site) {
        if (err)
          throw err;
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /sites/.test(url);
            });
          }).then(function() {
            var table = $$("table.tp-data > tbody > tr");
            expect(table.count()).toEqual(1);

            element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/sites/" + site._id + "']")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('sites\/' + site._id + '').test(url);
                });
              }).then(function() {
                expect(element(by.name("name")).getAttribute("value")).toEqual(site.name);
                expect(element(by.name("siteForm")).element(by.css("button")).getText()).toEqual("Изменить");
                expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.name("name")).clear();
                element(by.name("name")).sendKeys(site.name = "site new name");
                expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeTruthy();
                browser.debugger();
                element(by.name("siteForm")).element(by.css("button")).click().then(function() {
                  expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                  element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
                    var table = $$("table.tp-data > tbody > tr");
                    expect(table.count()).toEqual(1);
                    var row = table.get(0).all(by.css("td"));
                    expect(row.get(2).element(by.css("a[href='#/sites/" + site._id + "']")).getText()).toEqual("site new name");
                    Site.remove(done);
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
    it("should allow create site", function(done) {
      browser.get('http://localhost:' + browser.params.port + '/');
      element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return /sites/.test(url);
          });
        }).then(function() {
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeTruthy();
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).getText()).toEqual("СОЗДАТЬ");
          element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).click().then(function() {
            browser.driver.wait(function() {
              return browser.driver.getCurrentUrl().then(function(url) {
                return /sites\/new/.test(url);
              });
            }).then(function() {
              expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeFalsy();
              expect(element(by.name("name")).getAttribute("value")).toEqual("");
              expect(element(by.name("siteForm")).element(by.css("button")).getText()).toEqual("Сохранить");
              expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeFalsy();
              element(by.name("name")).sendKeys("created site");
              expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeTruthy();
              element(by.name("siteForm")).element(by.css("button")).click().then(function() {
                expect(element(by.name("siteForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
                  var table = $$("table.tp-data > tbody > tr");
                  expect(table.count()).toEqual(1);
                  var row = table.get(0).all(by.css("td"));
                  expect(row.get(2).element(by.css("a")).getText()).toEqual("created site");
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




