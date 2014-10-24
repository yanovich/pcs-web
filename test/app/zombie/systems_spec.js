/* test/support/systems_spec.js -- testing systems management
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("systems", function() {
  describe("when administrator logged in", function() {
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

    function showSite(site, cb) {
      browser.visit(url + '/#/sites/' + site._id, cb);
    }

    function addOutput(name, idx, cb) {
      expect(browser.query("input[name='n']")).not.toBe(null);
      expect(browser.query("div.form-group button[ng-click='addOutput()']:disabled")).not.toBe(null);
      browser.fill("n", "");
      browser.fill("n", name);//???????
      expect(browser.query('div.form-group label[ng-if="n.out && state.outputs[n.out] == undefined"]')).not.toBe(null);
      expect(browser.query('div.form-group p[ng-if="state.outputs[n.out] != undefined"]')).toBe(null);
      expect(browser.query("div.form-group button[ng-click='addOutput()']:disabled")).toBe(null);
      browser.pressButton("div.form-group button[ng-click='addOutput()']", function() {
        var outputs = browser.queryAll("div.form-group[ng-repeat='o in system.outputs']");
        expect(browser.text("label[for='" + name + "']", outputs[idx])).toEqual(name);
        expect(browser.text("label[ng-if='state.outputs[o] == undefined']", outputs[idx])).toEqual("Отсутствует");
        cb();
      });
    }

    function dropOutput(idx, cb) {
      var outputs = browser.queryAll("div.form-group[ng-repeat='o in system.outputs']");
      expect(outputs.length > idx).toBeTruthy();
      expect(browser.query("button[ng-click='dropOutput($index)']", outputs[idx])).not.toBe(null);
      browser.click(browser.query("button[ng-click='dropOutput($index)']", outputs[idx]), function() {
        expect(browser.queryAll("div.form-group[ng-repeat='o in system.outputs']").length).toEqual(outputs.length - 1);
        cb();
      });
    }

    function addSetpoint(name, value, idx, cb) {
      expect(browser.query("input[name='set']")).not.toBe(null);
      expect(browser.query("input[name='setValue']")).toBe(null);
      expect(browser.query("div.form-group button[ng-click='addSetpoint()']:disabled")).not.toBe(null);
      browser.fill("set", "");
      browser.fill("set", name);//???????
      expect(browser.query("input[name='setValue']")).not.toBe(null);
      expect(browser.query("div.form-group button[ng-click='addSetpoint()']")).not.toBe(null);
      browser.fill("setValue", "");
      browser.fill("setValue", value);//???????
      expect(browser.query("div.form-group button[ng-click='addSetpoint()']")).not.toBe(null);
      browser.pressButton("div.form-group button[ng-click='addSetpoint()']", function() {
        var outputs = browser.queryAll("div.form-group[ng-repeat='(key, value) in system.setpoints']");
        expect(browser.text("label[for='" + name + "']", outputs[idx])).toEqual(name);
        expect(browser.query("input[name='set." + name + "']", outputs[idx]).value).toEqual(value);
        cb();
      });
    }

    function dropSetpoint(idx, cb) {
      var outputs = browser.queryAll("div.form-group[ng-repeat='(key, value) in system.setpoints']");
      expect(outputs.length > idx).toBeTruthy();
      expect(browser.query("button[ng-click='dropSetpoint(key)']", outputs[idx])).not.toBe(null);
      browser.click(browser.query("button[ng-click='dropSetpoint(key)']", outputs[idx]));
      expect(browser.queryAll("div.form-group[ng-repeat='(key, value) in system.setpoints']").length).toEqual(outputs.length - 1);
      cb();
    }

    function checkSystem(system, cb) {
      browser.wait(function(window) {
        return window.document.querySelector("input[value='" + system.name + "']");
      }, function() {
        expect(browser.query("input[name='name']").value).toEqual(system.name);
        expect(browser.text("a[href='#/devices/" + system.device + "']")).toEqual(knownDevice.name);
        expect(browser.query("input[name='n']")).not.toBe(null);
        expect(browser.query("input[name='set']")).not.toBe(null);
        expect(browser.query("input[name='setValue']")).toBe(null);
        expect(browser.text("label#site")).toEqual(knownSite.name);
        var outputs = browser.queryAll("div.form-group[ng-repeat='o in system.outputs']");
        expect(outputs.length).toEqual(system.outputs.length);
        for (var i = 0; i < system.outputs.length; ++ i) {
          expect(browser.text('label[ng-if="state.outputs[o] == undefined"]', outputs[i])).toEqual("Отсутствует");
        }
        outputs = browser.queryAll("div.form-group[ng-repeat='(key, value) in system.setpoints']");
        var keys = Object.keys(system.setpoints);
        expect(outputs.length).toEqual(keys.length);
        browser.wait(function(window) {
          return window.document.querySelector("input[name='set." + keys[0] + "']");
        }, function() {
          for (var i = 0; i < keys.length; ++ i) {
            var key = keys[i];
            expect(browser.text("label[for='" + key + "']", outputs[i])).toEqual(key);
            expect(browser.query("input[name='set." + key + "']", outputs[i]).value).toEqual(system.setpoints[key].toString());
          }
          expect(browser.text("form[name='systemForm'] button[name='submit']")).toEqual("Изменить");
          expect(browser.query("form[name='systemForm'] button[name='submit']:disabled")).not.toBe(null);
          cb();
        });
      });
    }

    it("should allow create system", function(done) {
      showSite(knownSite, function() {
        expect(browser.query("div.tp-sidebar > ul.tp-tools-side > li > a")).not.toBe(null);
        expect(browser.text("div.tp-sidebar > ul.tp-tools-side > li > a")).toEqual("Создать");
        browser.clickLink("div.tp-sidebar > ul.tp-tools-side > li > a", function() {
          browser.wait(function(window) {
            return new RegExp('sites\/' + knownSite._id + '\/systems\/new').test(window.location.href);
          }, function() {
            expect(browser.query("div.tp-sidebar > ul.tp-tools-side > li > a")).toBe(null);
            expect(browser.query("input[name='name']").value).toEqual("");
            expect(browser.query("input[name='device']").value).toEqual("");
            expect(browser.query("input[name='n']")).toBe(null);
            expect(browser.query("input[name='set']")).toBe(null);
            expect(browser.query("input[name='setValue']")).toBe(null);
            expect(browser.text("label#site")).toEqual(knownSite.name);
            expect(browser.text("form[name='systemForm'] button[name='submit']")).toEqual("Сохранить");
            expect(browser.query("form[name='systemForm'] button[name='submit']:disabled")).not.toBe(null);
            expect(browser.query("a[href='#/devices/" + knownDevice._id + "']")).toBe(null);
            browser
              .fill("name", "automeated system")
              .fill("name", "automeated system")
              .fill("device", knownDevice.name);
            browser.wait(function(window) {
              return window.document.querySelector("a[href='#/devices/" + knownDevice._id + "']");
            }, function() {
              expect(browser.query("a[href='#/devices/" + knownDevice._id + "']")).not.toBe(null);
              addOutput("a34", 0, function() {
                addOutput("b5", 1, function() {
                  var outputs = browser.queryAll("div.form-group[ng-repeat='o in system.outputs']");
                  expect(outputs.length).toEqual(2);
                  //new State({device: device._id, stamp: new Date(), outputs: { a34: 46, b6: "vv"}}).save(function(err, newState) {
                  //if(err) throw err;
                  //browser.driver.wait(function() {
                  //  return outputs.get(0).element(by.css('p[ng-if="state.outputs[o] != undefined"]')).isPresent().then(function(value) {
                  //    return value;
                  //  });
                  //}).then(function() {
                  //expect(outputs.get(0).element(by.css('p[ng-if="state.outputs[o] != undefined"]')).getText()).toEqual("46");
                  dropOutput(1, function() {
                    addSetpoint("a34", "35", 0, function() {
                      addSetpoint("b6", "a", 1, function() {
                        dropSetpoint(1, function() {
                          expect(browser.query("form[name='systemForm'] button[name='submit']")).not.toBe(null);
                          browser.pressButton("form[name='systemForm'] button[name='submit']", function() {
                            expect(browser.query("form[name='systemForm'] button[name='submit']:disabled")).not.toBe(null);
                            showSite(knownSite, function() {
                              browser.wait(function(window) {
                                return window.document.querySelector("form[name='systemForm'] input[value='" + knownSite.name + "']");
                              }, function() {
                                table = browser.queryAll("table.tp-data > tbody > tr");
                                expect(table.length).toEqual(3);
                                expect(browser.text("a", table[0])).toEqual("automeated system");
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
          });
        });
      });
    });

    it("should show system", function(done) {
      table = browser.queryAll("table.tp-data > tbody > tr");
      expect(table.length).toEqual(3);
      expect(browser.text("a", table[2])).toEqual(knownSystem.name);
      browser.click(browser.query("a", table[2]));
      browser.wait(function(window) {
        return new RegExp('sites\/' + knownSite._id + '\/systems\/' + knownSystem._id).test(window.location.href);
      }, function() {
        checkSystem(knownSystem, done);
      });
    });

    it("should edit data", function(done) {
      addOutput("m2", 0, function() {
        dropSetpoint(0, function() {
          addSetpoint("m3", "asd", 1, function() {
            //element(by.name("name")).sendKeys(system.name = "system2");
            knownSystem.outputs = ["m2"];
            knownSystem.setpoints = { m2: "hello", m3: "asd" };
            expect(browser.query("form[name='systemForm'] button[name='submit']")).not.toBe(null);
            browser.pressButton("form[name='systemForm'] button[name='submit']", function() {
              expect(browser.query("form[name='systemForm'] button[name='submit']:disabled")).not.toBe(null);
              showSite(knownSite, function() {
                table = browser.queryAll("table.tp-data > tbody > tr");
                expect(table.length).toEqual(3);
                expect(browser.text("a", table[2])).toEqual(knownSystem.name);
                browser.click(browser.query("a", table[2]));
                browser.wait(function(window) {
                  return new RegExp('sites\/' + knownSite._id + '\/systems\/' + knownSystem._id).test(window.location.href);
                }, function() {
                  checkSystem(knownSystem, done);
                });
              });
            });
          });
        });
      });
    });
  });
});

