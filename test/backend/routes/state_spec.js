'use strict'
/* test/backend/routes/state_spec.js -- test State routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

require('../spec_helper');
var User = require('../../../models/user');
var Device = require('../../../models/device');
var State = require('../../../models/state');
var System = require('../../../models/system');
var Site = require('../../../models/site');
var Routes = require('../../../routes/state');

var operatorAttrs = {
  name: "Example Operator User",
  email: "user@example.com",
  password: 'password',
  confirmation: 'password',
};
var adminAttrs = {
  name: "Example Admin User",
  email: "admin@example.com",
  password: 'password',
  confirmation: 'password',
  admin: true
};
var deviceAttrs = {
  name: "unknown device",
};

describe('State\'s routes', function() {
  var operator, admin, device, utils;
  beforeEach(function(done) {
    (new User(operatorAttrs)).save(function(err, newUser) {
      operator = newUser;
      (new User(adminAttrs)).save(function(err, newAdmin) {
        admin = newAdmin;
        (new Device(deviceAttrs)).save(function(err, newDevice) {
          device = newDevice;
          utils = require('./_controller_util')(admin, operator);
          return done();
        });
      });
    });
  });

  describe("#index", function() {
    it("should authorize user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      utils.executer(Routes.index.slice(0), req, res);
    });


    function createMultipleStates(count, next) {
      var stamp = new Date();
      stamp.setSeconds(count);
      stamp.setMinutes(stamp.getMinutes() - 1);
      var state = {
        device: device._id,
        stamp: stamp,
        outputs: { m1: count },
      };
      (new State(state)).save(function(err) {
        if (err)
          throw "Error";
        count -= 1;
        if (count > 0) {
          createMultipleStates(count, next);
        } else {
          next();
        }
      });
    }

    function testCommonBehaviour(reqCreator) {
      var req;

      beforeEach(function() {
        req = reqCreator();
      });

      beforeEach(function(done) {
        createMultipleStates(51, function() {
          done();
        });
      });

      it("should retrieve 404 if device is not specified", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(404);
            done();
          },
        };
        req.query = {};
        utils.executer(Routes.index.slice(0), req, res);
      });

      it("should retrieve first page if not specified", function(done) {
        var res = {
          locals: {},
          json_ng: function(states) {
            expect(states.length).toEqual(26);
            expect(states[25].count).toEqual(51);
            done();
          },
        };
        req.query = {};
        req.device = device;
        utils.executer(Routes.index.slice(0), req, res);
      });

      it("should sort results by stamp", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(states) {
            var fetched = states.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = {};
        req.device = device;
        State.find({}, "_id").sort({stamp: -1}).limit(25).exec(function(err, states) {
          if (err)
            throw err;
          original = states.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should skip pages", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(states) {
            var fetched = states.slice(0, 1).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 3 };
        req.device = device;
        State.find({}, "_id").sort({stamp: -1}).skip(50).limit(25).exec(function(err, states) {
          if (err)
            throw err;
          original = states.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return first page if query is less then 1", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(states) {
            var fetched = states.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 0 };
        req.device = device;
        State.find({}, "_id").sort({stamp: -1}).limit(25).exec(function(err, states) {
          if (err)
            throw err;
          original = states.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return last page if query page bigger then real count", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(states) {
            var fetched = states.slice(0, 1).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 4 };
        req.device = device;
        State.find({}, "_id").sort({stamp: -1}).skip(50).limit(25).exec(function(err, states) {
          if (err)
            throw err;
          original = states.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      describe("when stream is pecified", function() {
        var res;
        beforeEach(function() {
          res = { locals: {} };
          req.device = device;
          req.query = { stream: true };
          req.socket = { setTimeout: jasmine.createSpy() };
          res.writeHead = jasmine.createSpy();
          res.write = jasmine.createSpy();
          req.on = jasmine.createSpy();
          jasmine.Clock.useMock();
        });

        afterEach(function() {
          req.on.calls[0].args[1]();
          jasmine.Clock.reset();
        });

        it("should set timeout on request socket", function(done) {
          res.write = function(str) {
            if (str.indexOf("data") === 0) {
              expect(req.socket.setTimeout).toHaveBeenCalledWith(Infinity);
              done();
            }
          };
          utils.executer(Routes.index.slice(0), req, res);
        });

        it("should set header on request socket", function(done) {
          res.write = function(str) {
            if (str.indexOf("data") === 0) {
              expect(res.writeHead).toHaveBeenCalledWith(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
              });
              done();
            }
          };
          utils.executer(Routes.index.slice(0), req, res);
        });

        it("should call write with \\n symbol", function(done) {
          var args = [];
          res.write = function(str) {
            args.push(str);
            if (str.indexOf("data") === 0) {
              expect(args.length > 0).toBeTruthy();
              expect(args[0]).toEqual("\n");
              done();
            }
          };
          utils.executer(Routes.index.slice(0), req, res);
        });

        it("should write state data", function(done) {
          var args = [];
          res.write = function(str) {
            args.push(str);
            if (str.indexOf("data") === 0) {
              State.find({ device: req.device._id }, "_id device stamp outputs")
                .sort({ stamp: -1 })
                .limit(1)
                .exec(function (err, states) {
                  expect(args.length).toEqual(3);
                  expect(args[1]).toEqual("id: state\n");
                  expect(args[2]).toEqual("data: " + JSON.stringify(states[0]) + "\n\n");
                  done();
              });
            }
          };
          utils.executer(Routes.index.slice(0), req, res);
        });

        it("should write state data every 1 second", function(done) {
          var args = [];
          var firstSend = true;
          res.write = function(str) {
            args.push(str);
            if (str.indexOf("data") === 0) {
              if (firstSend) {
                expect(args.length).toEqual(3);
                args = [];
                firstSend = false;
                (new State({device: device._id, stamp: new Date(), outputs: { m1: 100 }})).save(function(err, newState) {
                  jasmine.Clock.tick(1001);
                });
              } else {
                State.find({ device: req.device._id }, "_id device stamp outputs")
                .sort({ stamp: -1 })
                .limit(1)
                .exec(function (err, states) {
                  expect(args.length).toEqual(2);
                  expect(args[0]).toEqual("id: state\n");
                  expect(args[1]).toEqual("data: " + JSON.stringify(states[0]) + "\n\n");
                  done();
                });
              }
            }
          };
          utils.executer(Routes.index.slice(0), req, res);
        });

        it("should write state data every n seconds from query", function(done) {
          var args = [];
          var firstSend = true;
          res.write = function(str) {
            args.push(str);
            if (str.indexOf("data") === 0) {
              if (firstSend) {
                expect(args.length).toEqual(3);
                args = [];
                firstSend = false;
                (new State({device: device._id, stamp: new Date(), outputs: { m1: 100 }})).save(function(err, newState) {
                  jasmine.Clock.tick(5 * 1000 + 1);
                });
              } else {
                State.find({ device: req.device._id }, "_id device stamp outputs")
                .sort({ stamp: -1 })
                .limit(1)
                .exec(function (err, states) {
                  expect(args.length).toEqual(2);
                  expect(args[0]).toEqual("id: state\n");
                  expect(args[1]).toEqual("data: " + JSON.stringify(states[0]) + "\n\n");
                  done();
                });
              }
            }
          };
          req.query.interval = 5
          utils.executer(Routes.index.slice(0), req, res);
        });
      });


    };

    describe("operator signed in", function() {
      testCommonBehaviour(function() { return utils.operatorRequest.apply(utils, arguments); });
    });

    describe("administrator signed in", function() {
      testCommonBehaviour(function() { return utils.adminRequest.apply(utils, arguments); });
    });
  });

  describe("#create", function() {
    var system, req, res;
    beforeEach(function(done) {
      (new Site({name: "hello site"})).save(function(err, newSite) {
        (new System({site: newSite._id, device: device._id, name: "system", setpoints: {m2:33}})).save(function(err, newSystem) {
          system = newSystem;
          req = {
            method: "PUT",
            headers: {
              'content-type': "application/x-device-data"
            },
            on: jasmine.createSpy(),
            once: jasmine.createSpy(),
          };
          res = {};
          done();
        });
      });
    });

    it("should check method is PUT", function() {
      var next = jasmine.createSpy();
      req.method = "GET";
      Routes.create(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should check content-type", function() {
      var next = jasmine.createSpy();
      req.headers = {};
      Routes.create(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should do nothing", function() {
      res.write = jasmine.createSpy();
      res.writeHead = jasmine.createSpy();
      res.send = jasmine.createSpy();
      Routes.create(req, res);
      req.on.calls[0].args[1]("\n");
      expect(res.write).not.toHaveBeenCalled();
      expect(res.writeHead).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });

    it("should write undefined to response if JSON is not parsed", function() {
      res.write = jasmine.createSpy();
      Routes.create(req, res);
      req.on.calls[0].args[1]("{1");
      expect(res.write).toHaveBeenCalledWith(toString());
    });

    describe("when device is not specified", function() {
      it("should response with error if device was not sent", function(done) {
        res.send = function(code) {
          expect(code).toEqual(500);
          done();
        };
        Routes.create(req, res, null);
        expect(req.on).toHaveBeenCalled();
        req.removeListener = jasmine.createSpy();
        req.on.calls[0].args[1](JSON.stringify({'a':1}));
        expect(req.removeListener).toHaveBeenCalled();
        expect(req.removeListener.calls.length).toEqual(4);
      });

      it("should response with error if device is not found", function(done) {
        res.send = function(code) {
          expect(code).toEqual(500);
          done();
        };
        Routes.create(req, res, null);
        expect(req.on).toHaveBeenCalled();
        req.removeListener = jasmine.createSpy();
        req.on.calls[0].args[1](JSON.stringify({'device':1}));
        expect(req.removeListener).toHaveBeenCalled();
        expect(req.removeListener.calls.length).toEqual(4);
      });

      it("should response with ok status", function(done) {
        res.writeHead = jasmine.createSpy();
        res.write = function(str) {
          expect(res.writeHead).toHaveBeenCalledWith(200);
          expect(str).toEqual("ok");
          done();
        };
        Routes.create(req, res, null);
        req.on.calls[0].args[1](JSON.stringify({'device':device._id}));
      });
    });

    describe("when device registered", function() {
      var onData;
      beforeEach(function(done) {
        res.writeHead = jasmine.createSpy();
        res.write = function(str) {
          expect(str).toEqual("ok");
          done();
        };
        Routes.create(req, res, null);
        (onData = req.on.calls[0].args[1])(JSON.stringify({'device':device._id}));
      });

      it("should response with ne line if new line received", function() {
        res.write = jasmine.createSpy();
        onData("\n");
        expect(res.write).toHaveBeenCalledWith("\n");
      });

      it("should not response if system was not found", function() {
        res.write = null;
        res.writeHead = null;
        res.send = null;
        onData(JSON.stringify({a1:9}));
      });

      it("should write setpoints", function(done) {
        (new Site({name: "hello site 2"})).save(function(err, newSite) {
          (new System({site: newSite._id, device: device._id, name: "system", setpoints: {m2:33}})).save(function(err, newSystem) {
            res.write = function(str) {
              expect(str).toEqual(JSON.stringify({m2:33}));
              done();
            };
            onData(JSON.stringify({m2:9}));
          });
        });
      });

      it("should create state", function() {
        var newCount = 0, oldCount = 0;
        res.write = jasmine.createSpy();
        runs(function() {
          State.count({device: device._id}, function(err, count) {
            oldCount = count;
            onData(JSON.stringify({a1:982}));
            function onGetCount() {
              State.count({device: device._id}, function(err, cnt) {
                newCount = cnt;
                if (newCount === count) setTimeout(onGetCount, 100);
              });
            };
            onGetCount();
          });
        });

        waitsFor(function() {
          return newCount !== oldCount && newCount != 0;
        }, "Wiats while count of states changed", 1000);

        runs(function() {
          expect(newCount).toEqual(oldCount + 1);
        });
      });
    });
  });
});


