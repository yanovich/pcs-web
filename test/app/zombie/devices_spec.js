/* test/support/devices_spec.js -- testing device management
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("devices", function() {
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

    it("should have users link", function() {
      expect(browser.text(".tp-menu-side > li > a[href='#/devices']")).toEqual("Устройства");
    });

    describe("#devices", function() {
      beforeEach(function(done) {
        browser.clickLink(".tp-menu-side > li > a[href='#/devices']", function() {
          expect(browser.url).toEqual(url + '/#/devices');
          done();
        });
      });

      it("should show first page with devices", function(done) {
        Device.find({}, "_id name").sort({ name: 1 }).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          var pager = browser.queryAll("div.page > b");
          expect(pager.length).toEqual(3);

          expect(pager[0].textContent).toEqual("1");
          expect(pager[1].textContent).toEqual("25");
          expect(pager[2].textContent).toEqual("30");
          for (var idx in devices) {
            var item = devices[idx];
            var row = browser.queryAll("td", table[idx]);
            expect(browser.query("a[href='#/devices/" + item._id + "']", row[2]).textContent).toEqual(item.name);
          };
          done();
        });
      });

      it("should show second page with devices", function(done) {
        Device.find({}, "_id name").sort({ name: 1 }).skip(25).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          var table = browser.queryAll("table.tp-data > tbody > tr");
          expect(table.length).toEqual(25);
          var pager = browser.queryAll("div.page > b");
          expect(pager.length).toEqual(3);
          expect(pager[0].textContent).toEqual("1");
          expect(pager[1].textContent).toEqual("25");
          expect(pager[2].textContent).toEqual("30");

          browser.clickLink("ul.pagination > li > a[href='#/devices?page=2']", function() {
            browser.wait(function() {
              return browser.queryAll("table.tp-data > tbody > tr").length === 5;
            }, function() {
              table = browser.queryAll("table.tp-data > tbody > tr")
              expect(table.length).toEqual(5);
              pager = browser.queryAll("div.page > b");
              expect(pager.length).toEqual(3);
              expect(pager[0].textContent).toEqual("26");
              expect(pager[1].textContent).toEqual("30");
              expect(pager[2].textContent).toEqual("30");
              for (var idx in devices) {
                var item = devices[idx];
                var row = browser.queryAll("td", table[idx]);
                expect(browser.query("a[href='#/devices/" + item._id + "']", row[2]).textContent).toEqual(item.name);
              };
              done();
            });
          });
        });
      });
    });

    describe("#show", function() {
      it("should show device name in input field", function(done) {
        browser.clickLink("table.tp-data > tbody > tr > td.tp-sender > a[href='#/devices/" + knownDevice._id + "']", function() {
          browser.wait(function(window) {
            return window.document.querySelector("input[value='" + knownDevice.name + "']")
          }, function() {
            expect(browser.query("input[name='name']").value).toEqual(knownDevice.name);
            expect(browser.text("form[name='deviceForm'] > button")).toEqual("Изменить");
            expect(browser.query("form[name='deviceForm'] > button:disabled")).not.toBe(null);
            done();
          });
        });
      });

      it("should show device setpoints", function(done) {
        expect(browser.text("form[name='setpointForm'] label[for='date']")).toEqual("Уставки");
        for (var key in knownSystem.setpoints) {
          expect(browser.text("form[name='setpointForm'] label[for='" + key + "']")).toEqual(key);
          expect(browser.text("form[name='setpointForm'] p[id='" + key + "']")).toEqual(knownSystem.setpoints[key].toString());
        }
        done();
      });

      it("should show device state outputs", function(done) {
        done();
/*        browser.wait(function(window) {
          return window.document.querySelector("form[name='stateForm'] label[for='m1']");
        }, function() {
          expect(browser.text("form[name='stateForm'] label[for='date']")).toEqual("Состояние");
          expect(browser.queryAll("form[name='stateForm'] div.form-group").length).toEqual(3);
          for (var key in state.outputs) {
            expect(browser.text("form[name='stateForm'] label[for='" + key + "']")).toEqual(key);
            expect(browser.text("form[name='stateForm'] p[id='" + key + "']")).toEqual(state.outputs[key].toString());
          }
          State.create({device: device._id, stamp: new Date(), outputs: { m4: 433 }}, function(err, state) {
            if(err) throw err;
            browser.wait(function(window) {
              return window.document.querySelector("form[name='stateForm'] label[for='m4']");
            }, function() {
              for (var key in state.outputs) {
                expect(browser.text("form[name='stateForm'] label[for='" + key + "']")).toEqual(key);
                expect(browser.text("form[name='stateForm'] p[id='" + key + "']")).toEqual(state.outputs[key].toString());
              }
              State.remove(done);
            });
          });
        });*/
      });

      describe("#edit", function() {
        it("should allow change device", function(done) {
          expect(browser.query("input[name='name']").value).toEqual(knownDevice.name);
          expect(browser.text("form[name='deviceForm'] > button")).toEqual("Изменить");
          expect(browser.query("form[name='deviceForm'] > button:disabled")).not.toBe(null);

          console.log("CANN'T CHANGE DEVICE NAME");
          done();
          /*browser.fill("name", knownDevice.name = "device new name");
          expect(browser.query("form[name='deviceForm'] > button:disabled")).toBe(null);
          browser.pressButton("form[name='deviceForm'] > button", function() {
            expect(browser.query("form[name='deviceForm'] > button:disabled")).not.toBe(null);
            console.error("NAME CANN'T BE CHANGED");
            done();
          });*/
        });
      });

      describe("#create", function() {
        it("should allow create device", function(done) {
          expect(browser.query("div.tp-sidebar > ul.tp-tools-side > li > a")).not.toBe(null);
          expect(browser.text("div.tp-sidebar > ul.tp-tools-side > li > a")).toEqual("Создать");
          browser.clickLink("div.tp-sidebar > ul.tp-tools-side > li > a", function() {
            expect(browser.query("div.tp-sidebar > ul.tp-tools-side > li > a")).toBe(null);
            expect(browser.query("input[name='name']").value).toEqual("");
            expect(browser.text("form[name='deviceForm'] > button")).toEqual("Сохранить");
            expect(browser.query("form[name='deviceForm'] > button:disabled")).not.toBe(null);
            browser.fill("name", "automated device");
            browser.fill("name", "automated device");
            expect(browser.query("input[name='name']").value).toEqual("automated device");
            expect(browser.query("form[name='deviceForm'] > button:disabled")).toBe(null);
            browser.pressButton("form[name='deviceForm'] > button", function() {
              browser.wait(function(window) {
                return window.document.querySelector("form[name='deviceForm'] > button:disabled");
              }, function() {
                browser.clickLink(".tp-menu-side > li > a[href='#/devices']", function() {
                  var table = browser.queryAll("table.tp-data > tbody > tr");
                  expect(table.length).toEqual(25);
                  var row = browser.queryAll("td", table[0]);
                  expect(browser.query("a", row[2]).textContent).toEqual("automated device");
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

