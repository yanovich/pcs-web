var Device = require('../../../models/device');
var System = require('../../../models/system');
var Site = require('../../../models/site');
var State = require('../../../models/state');


describe("systems", function() {
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

  describe("when administrator work with site's systems", function() {
    function goToSites(cb) {
      browser.get('http://localhost:' + browser.params.port + '/');
      element(by.css(".tp-menu-side > li > a[href='#/sites']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return /sites/.test(url);
          });
        }).then(cb);
      });
    }

    function showSite(site, cb) {
      element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/sites/" + site._id + "']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return new RegExp('sites\/' + site._id + '').test(url);
          });
        }).then(cb);
      });
    }

    function addOutput(name, idx, cb) {
      expect(element(by.name("n")).isPresent()).toBeTruthy();
      expect(element(by.css("div.form-group button[ng-click='addOutput()']")).isEnabled()).toBe(false);
      element(by.name("n")).sendKeys(name);
      element(by.css('div.form-group label[ng-if="n.out && state.outputs[n.out] == undefined"]')).isPresent().then(function(val) {
        expect(val).toBeTruthy();
        element(by.css('div.form-group p[ng-if="state.outputs[n.out] != undefined"]')).isPresent().then(function(val) {
          expect(val).toBeFalsy();
          expect(element(by.css("div.form-group button[ng-click='addOutput()']")).isEnabled()).toBe(true);
          element(by.css("div.form-group button[ng-click='addOutput()']")).click().then(function() {
            var outputs = $$("div.form-group[ng-repeat='o in system.outputs']");
            expect(outputs.get(idx).element(by.css("label[for='" + name + "']")).getText()).toEqual(name);
            expect(outputs.get(idx).element(by.css("label[ng-if='state.outputs[o] == undefined']")).getText()).toEqual("Отсутствует");
            cb();
          });
        });
      });
    }

    function dropOutput(idx, cb) {
      var outputs = $$("div.form-group[ng-repeat='o in system.outputs']");
      outputs.count().then(function(count) {
        expect(count > idx).toBeTruthy();
        expect(outputs.get(idx).element(by.css("button[ng-click='dropOutput($index)']")).isPresent()).toBeTruthy();
        outputs.get(idx).element(by.css("button[ng-click='dropOutput($index)']")).click().then(function() {
          expect($$("div.form-group[ng-repeat='o in system.outputs']").count()).toEqual(count - 1);
          cb();
        });
      });
    }

    function addSetpoint(name, value, idx, cb) {
      expect(element(by.name("set")).isPresent()).toBeTruthy();
      expect(element(by.name("setValue")).isPresent()).toBeFalsy();
      expect(element(by.css("div.form-group button[ng-click='addSetpoint()']")).isEnabled()).toBe(false);
      element(by.name("set")).sendKeys(name);
      expect(element(by.name("setValue")).isPresent()).toBeTruthy();
      expect(element(by.css("div.form-group button[ng-click='addSetpoint()']")).isEnabled()).toBe(true);
      element(by.name("setValue")).sendKeys(value);
      expect(element(by.css("div.form-group button[ng-click='addSetpoint()']")).isEnabled()).toBe(true);
      element(by.css("div.form-group button[ng-click='addSetpoint()']")).click().then(function() {
        var outputs = $$("div.form-group[ng-repeat='(key, value) in system.setpoints']");
        expect(outputs.get(idx).element(by.css("label[for='" + name + "']")).getText()).toEqual(name);
        expect(outputs.get(idx).element(by.name("set." + name)).getAttribute("value")).toEqual(value);
        cb();
      });
    }

    function dropSetpoint(idx, cb) {
      var outputs = $$("div.form-group[ng-repeat='(key, value) in system.setpoints']");
      outputs.count().then(function(count) {
        expect(count > idx).toBeTruthy();
        expect(outputs.get(idx).element(by.css("button[ng-click='dropSetpoint(key)']")).isPresent()).toBeTruthy();
        outputs.get(idx).element(by.css("button[ng-click='dropSetpoint(key)']")).click().then(function() {
          expect($$("div.form-group[ng-repeat='(key, value) in system.setpoints']").count()).toEqual(count - 1);
          cb();
        });
      });
    }

    function checkSystem(system, cb) {
      expect(element(by.name("name")).getAttribute("value")).toEqual(system.name);
      expect(element(by.name("device")).getAttribute("value")).toEqual(device.name);
      expect(element(by.name("n")).isPresent()).toBeTruthy();
      expect(element(by.name("set")).isPresent()).toBeTruthy();
      expect(element(by.name("setValue")).isPresent()).toBeFalsy();
      expect(element(by.css("label#site")).getText()).toEqual(site.name);
      expect(element(by.css("a[href='#/devices/" + device._id + "']")).isPresent()).toBeTruthy();
      var outputs = $$("div.form-group[ng-repeat='o in system.outputs']");
      expect(outputs.count()).toEqual(system.outputs.length);
      for (var i = 0; i < system.outputs.length; ++ i) {
        expect(outputs.get(i).element(by.css('label[ng-if="state.outputs[o] == undefined"]')).getText()).toEqual("Отсутствует");
      }
      outputs = $$("div.form-group[ng-repeat='(key, value) in system.setpoints']");
      var keys = Object.keys(system.setpoints);
      expect(outputs.count()).toEqual(keys.length);
      for (var i = 0; i < keys.length; ++ i) {
        var key = keys[i];
        expect(outputs.get(i).element(by.css("label[for='" + key + "']")).getText()).toEqual(key);
        expect(outputs.get(i).element(by.name("set." + key)).getAttribute("value")).toEqual(system.setpoints[key]);
      }
      expect(element(by.name("systemForm")).element(by.css("button")).getText()).toEqual("Изменить");
      expect(element(by.name("systemForm")).element(by.css("button")).isEnabled()).toBeFalsy();
      cb();
    }

    var site = null, device = null;
    beforeEach(function(done) {
      devices = [];
      new Site({name: "unknown site"}).save(function(err, newSite) {
        site = newSite;
        new Device({name: "some device"}).save(function(err, dev1) {
          device = dev1;
          done();
        });
      });
    });

    it("should allow create system", function(done) {
      goToSites(function() {
        showSite(site, function() {
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeTruthy();
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).getText()).toEqual("СОЗДАТЬ");
          element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).click().then(function() {
            browser.driver.wait(function() {
              return browser.driver.getCurrentUrl().then(function(url) {
                return new RegExp('sites\/' + site._id + '\/systems\/new').test(url);
              });
            }).then(function() {
              expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeFalsy();
              expect(element(by.name("name")).getAttribute("value")).toEqual("");
              expect(element(by.name("device")).getAttribute("value")).toEqual("");
              expect(element(by.name("n")).isPresent()).toBeFalsy();
              expect(element(by.name("set")).isPresent()).toBeFalsy();
              expect(element(by.name("setValue")).isPresent()).toBeFalsy();
              expect(element(by.css("label#site")).getText()).toEqual(site.name);
              expect(element(by.name("systemForm")).element(by.css("button")).getText()).toEqual("Сохранить");
              expect(element(by.name("systemForm")).element(by.css("button")).isEnabled()).toBeFalsy();
              expect(element(by.css("a[href='#/devices/" + device._id + "']")).isPresent()).toBeFalsy();
              element(by.name("name")).sendKeys("some system");
              element(by.name("device")).sendKeys(device.name);
              expect(element(by.css("a[href='#/devices/" + device._id + "']")).isPresent()).toBeTruthy();
              addOutput("a34", 0, function() {
                addOutput("b5", 1, function() {
                  var outputs = $$("div.form-group[ng-repeat='o in system.outputs']");
                  expect(outputs.count()).toEqual(2);
                  new State({device: device._id, stamp: new Date(), outputs: { a34: 46, b6: "vv"}}).save(function(err, newState) {
                    if(err) throw err;
                    browser.driver.wait(function() {
                      return outputs.get(0).element(by.css('p[ng-if="state.outputs[o] != undefined"]')).isPresent().then(function(value) {
                        return value;
                      });
                    }).then(function() {
                      expect(outputs.get(0).element(by.css('p[ng-if="state.outputs[o] != undefined"]')).getText()).toEqual("46");
                      dropOutput(1, function() {
                        addSetpoint("a34", "35", 0, function() {
                          addSetpoint("b6", "a", 1, function() {
                            dropSetpoint(1, function() {
                              element(by.name("systemForm")).element(by.css("button")).click().then(function() {
                                expect(element(by.name("systemForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                                goToSites(function() {
                                  showSite(site, function() {
                                    table = $$("table.tp-data > tbody > tr");
                                    expect(table.count()).toEqual(1);
                                    expect(element(by.css("table.tp-data a")).getText()).toEqual("some system");
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
      });
    });

    it("should show data", function(done) {
      System.create({name: "system1", site: site._id, device: device._id, outputs: ["m1"], setpoints: { m1: "1000", m2: "hello" }}, function(err, system) {
        goToSites(function() {
          showSite(site, function() {
            table = $$("table.tp-data > tbody > tr");
            expect(table.count()).toEqual(1);
            expect(element(by.css("table.tp-data a")).getText()).toEqual(system.name);
            element(by.css("table.tp-data a")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('sites\/' + site._id + '\/systems\/' + system._id).test(url);
                });
              }).then(function() {
                checkSystem(system, done);
              });
            });
          });
        });
      });
    });

    it("should edit data", function(done) {
      System.create({name: "system1", site: site._id, device: device._id, outputs: ["m1"], setpoints: { m1: "1000", m2: "hello" }}, function(err, system) {
        goToSites(function() {
          showSite(site, function() {
            table = $$("table.tp-data > tbody > tr");
            expect(table.count()).toEqual(1);
            expect(element(by.css("table.tp-data a")).getText()).toEqual(system.name);
            element(by.css("table.tp-data a")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('sites\/' + site._id + '\/systems\/' + system._id).test(url);
                });
              }).then(function() {
                checkSystem(system, function() {
                  addOutput("m2", 1, function() {
                    dropSetpoint(0, function() {
                      addSetpoint("m3", "asd", 1, function() {
                        //element(by.name("name")).sendKeys(system.name = "system2");
                        system.outputs = ["m1", "m2"];
                        system.setpoints = { m2: "hello", m3: "asd" };
                        browser.debugger();
                        element(by.name("systemForm")).element(by.css("button")).click().then(function() {
                          expect(element(by.name("systemForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                          goToSites(function() {
                            showSite(site, function() {
                              table = $$("table.tp-data > tbody > tr");
                              expect(table.count()).toEqual(1);
                              element(by.css("table.tp-data a")).click().then(function() {
                                browser.driver.wait(function() {
                                  return browser.driver.getCurrentUrl().then(function(url) {
                                    return new RegExp('sites\/' + site._id + '\/systems\/' + system._id).test(url);
                                  });
                                }).then(function() {
                                  checkSystem(system, done);
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
    });

    afterEach(function(done) {
      System.remove(function() {
        State.remove(function() {
          Device.remove(function() {
            Site.remove(done);
          });
        });
      });
    });
  });
});

