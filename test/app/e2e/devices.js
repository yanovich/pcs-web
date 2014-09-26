var Device = require('../../../models/device');
var System = require('../../../models/system');
var Site = require('../../../models/site');
var State = require('../../../models/state');


describe("devices", function() {
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
      Device.remove(done);
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

  it("should have devices link", function() {
    browser.get('http://localhost:' + browser.params.port + '/');
    element(by.css(".tp-menu-side > li > a[href='#/devices']")).getText().then(function(link) {
      expect(link).toEqual("Устройства");
    });
  });

  describe("#devices", function() {
    function createMultipleDevices(count, next) {
      var device = {
        name: "device#" + count,
      };
      (new Device(device)).save(function(err) {
        if (err)
          throw "Error";
        count -= 1;
        if (count > 0) {
          createMultipleDevices(count, next);
        } else {
          next();
        }
      });
    }


    beforeEach(function(done) {
      createMultipleDevices(30, function() {
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/devices']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /devices/.test(url);
            });
          }).then(function() {
            done();
          });
        });
      });
    });

    afterEach(function(done) {
      Device.remove(function(err) {
        if(err) console.error(err);
        done();
      });
    });

    it("should show first page with devices", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(25);
      var pager = $$("div.page > b");
      expect(pager.count()).toEqual(3);
      expect(pager.get(0).getText()).toEqual("1");
      expect(pager.get(1).getText()).toEqual("25");
      expect(pager.get(2).getText()).toEqual("30");
      Device.find({}, "_id name").sort({ name: 1 }).limit(25).exec(function(err, devices) {
        if (err)
          throw err;
        for (var idx in devices) {
          var item = devices[idx];
          var row = table.get(idx).all(by.css("td"));
          expect(row.get(2).element(by.css("a[href='#/devices/" + item._id + "']")).getText()).toEqual(item.name);
        };
        done();
      });
    });

    it("should show second page with devices", function(done) {
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
        Device.find({}, "_id name").sort({ name: 1 }).skip(25).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          for (var idx in devices) {
            var item = devices[idx];
            var row = table.get(idx).all(by.css("td"));
            expect(row.get(2).element(by.css("a[href='#/devices/" + item._id + "']")).getText()).toEqual(item.name);
          };
          done();
        });
      });
    });
  });

  describe("#show", function() {
    var device = null,
        setpoints = null,
        state = null;
    beforeEach(function(done) {
      Device.create({name: "dev1"}, function(err, dev) {
        if (err)
          throw err;
        device = dev;
        Site.create({name: "site1"}, function(err, site) {
          if (err)
            throw err;
          System.create({name: "system1", site: site._id, device: device._id, setpoints: { m1: 1000, m2: "hello" }}, function(err, system) {
            if (err) throw err;
            setpoints = system.setpoints;

            browser.get('http://localhost:' + browser.params.port + '/');
            element(by.css(".tp-menu-side > li > a[href='#/devices']")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return /devices/.test(url);
                });
              }).then(function() {
                done();
              });
            });
          });
        });
      });
    });

    afterEach(function(done) {
      Device.remove(function() {
        Site.remove(function() {
          System.remove(function() {
            done();
          });
        });
      });
    });

    it("should show device name in input field", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(1);

      element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/devices/" + device._id + "']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return new RegExp('devices\/' + device._id + '').test(url);
          });
        }).then(function() {
          expect(element(by.name("name")).getAttribute("value")).toEqual(device.name);
          expect(element(by.name("deviceForm")).element(by.css("button")).getText()).toEqual("Изменить");
          expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeFalsy();
          done();
        });
      });
    });

    it("should show device setpoints", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(1);

      element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/devices/" + device._id + "']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return new RegExp('devices\/' + device._id + '').test(url);
          });
        }).then(function() {
          expect(element(by.css("form[name='setpointForm'] label[for='date']")).getText()).toEqual("Уставки");
          for (var key in setpoints) {
            expect(element(by.css("form[name='setpointForm'] label[for='" + key + "']")).getText()).toEqual(key);
            expect(element(by.css("form[name='setpointForm'] p[id='" + key + "']")).getText()).toEqual(setpoints[key].toString());
          }
          done();
        });
      });
    });

    it("should show device outputs", function(done) {
      var table = $$("table.tp-data > tbody > tr");
      expect(table.count()).toEqual(1);

      State.create({device: device._id, stamp: new Date(2013, 8, 23), outputs: { m1: 567, m2: "world" }}, function(err, state) {
        if(err) throw err;
        element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/devices/" + device._id + "']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return new RegExp('devices\/' + device._id + '').test(url);
            });
          }).then(function() {
            expect(element(by.css("form[name='stateForm'] label[for='date']")).getText()).toEqual("Состояние");
            expect(element.all(by.css("form[name='stateForm'] div.form-group")).count()).toEqual(3);
            for (var key in state.outputs) {
              expect(element(by.css("form[name='stateForm'] label[for='" + key + "']")).getText()).toEqual(key);
              expect(element(by.css("form[name='stateForm'] p[id='" + key + "']")).getText()).toEqual(state.outputs[key].toString());
            }
            State.create({device: device._id, stamp: new Date(), outputs: { m1: 433 }}, function(err, state) {
              if(err) throw err;
              browser.driver.wait(function() {
                return element.all(by.css("form[name='stateForm'] div.form-group")).then(function(elems) {
                  return elems.length == 2;
                });
              }).then(function() {
                for (var key in state.outputs) {
                  expect(element(by.css("form[name='stateForm'] label[for='" + key + "']")).getText()).toEqual(key);
                  expect(element(by.css("form[name='stateForm'] p[id='" + key + "']")).getText()).toEqual(state.outputs[key].toString());
                }
                State.remove(done);
              });
            });
          });
        });
      });
    });
  });

  describe("#edit", function() {
    it("should allow change device", function(done) {
      Device.create({name: "dev"}, function(err, device) {
        if (err)
          throw err;
        browser.get('http://localhost:' + browser.params.port + '/');
        element(by.css(".tp-menu-side > li > a[href='#/devices']")).click().then(function() {
          browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
              return /devices/.test(url);
            });
          }).then(function() {
            var table = $$("table.tp-data > tbody > tr");
            expect(table.count()).toEqual(1);

            element(by.css("table.tp-data > tbody > tr > td.tp-sender > a[href='#/devices/" + device._id + "']")).click().then(function() {
              browser.driver.wait(function() {
                return browser.driver.getCurrentUrl().then(function(url) {
                  return new RegExp('devices\/' + device._id + '').test(url);
                });
              }).then(function() {
                expect(element(by.name("name")).getAttribute("value")).toEqual(device.name);
                expect(element(by.name("deviceForm")).element(by.css("button")).getText()).toEqual("Изменить");
                expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.name("name")).clear();
                element(by.name("name")).sendKeys(device.name = "device new name");
                expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeTruthy();
                element(by.name("deviceForm")).element(by.css("button")).click().then(function() {
                  browser.debugger();
                  expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                  element(by.css(".tp-menu-side > li > a[href='#/devices']")).click().then(function() {
                    var table = $$("table.tp-data > tbody > tr");
                    expect(table.count()).toEqual(1);
                    var row = table.get(0).all(by.css("td"));
                    expect(row.get(2).element(by.css("a[href='#/devices/" + device._id + "']")).getText()).toEqual("device new name");
                    Device.remove(done);
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
    it("should allow create device", function(done) {
      browser.get('http://localhost:' + browser.params.port + '/');
      element(by.css(".tp-menu-side > li > a[href='#/devices']")).click().then(function() {
        browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return /devices/.test(url);
          });
        }).then(function() {
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeTruthy();
          expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).getText()).toEqual("СОЗДАТЬ");
          element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).click().then(function() {
            browser.driver.wait(function() {
              return browser.driver.getCurrentUrl().then(function(url) {
                return /devices\/new/.test(url);
              });
            }).then(function() {
              expect(element(by.css("div.tp-sidebar > ul.tp-tools-side > li > a")).isPresent()).toBeFalsy();
              expect(element(by.name("name")).getAttribute("value")).toEqual("");
              expect(element(by.name("deviceForm")).element(by.css("button")).getText()).toEqual("Сохранить");
              expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeFalsy();
              element(by.name("name")).sendKeys("created device");
              expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeTruthy();
              element(by.name("deviceForm")).element(by.css("button")).click().then(function() {
                expect(element(by.name("deviceForm")).element(by.css("button")).isEnabled()).toBeFalsy();
                element(by.css(".tp-menu-side > li > a[href='#/devices']")).click().then(function() {
                  var table = $$("table.tp-data > tbody > tr");
                  expect(table.count()).toEqual(1);
                  var row = table.get(0).all(by.css("td"));
                  expect(row.get(2).element(by.css("a")).getText()).toEqual("created device");
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



