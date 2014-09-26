'use strict'
/* test/backend/routes/device_spec.js -- test Device routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

require('../spec_helper');
var User = require('../../../models/user');
var Device = require('../../../models/device');
var Routes = require('../../../routes/device');

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
  name: "Some device",
};

describe('Device\'s routes', function() {
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

  describe("#load", function() {
    it("should find by id and assign device to req", function(done) {
      var req = { },
      id = device._id;

      Routes.load(req, {}, function() {
        expect(req.device.toJSON()).toEqual(device.toJSON());
        done();
      }, id);
    });

    it("should respond with not found code", function(done) {
      var res = {
        send: function(code) {
          expect(code).toEqual(404);
          done();
        }
      };
      Routes.load({}, res, null, 0);
    });
  });

  describe("#show", function() {
    it("should allow access for authorized users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      utils.executer(Routes.show.slice(0), req, res);
    });

    describe("when operator logged in", function() {
      var req;

      beforeEach(function() {
        req = utils.operatorRequest();
      });

      it("should return not found if device is not exist", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(404);
            done();
          },
        };
        utils.executer(Routes.show.slice(0), req, res);
      });


      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(dev) {
            expect(Object.keys(dev)).toEqual(['_id', 'name']);
            expect(dev._id).toEqual(device._id);
            expect(dev.name).toEqual(device.name);
            done();
          },
        };
        req.device = device;
        req.device.some_field = true;
        utils.executer(Routes.show.slice(0), req, res);
      });
    });

    describe("when administrator logged in", function() {
      var req;

      beforeEach(function() {
        req = utils.adminRequest();
      });

      it("should return not found if device is not exist", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(404);
            done();
          },
        };
        utils.executer(Routes.show.slice(0), req, res);
      });


      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(dev) {
            expect(Object.keys(dev)).toEqual(['_id', 'name']);
            expect(dev._id).toEqual(device._id);
            expect(dev.name).toEqual(device.name);
            done();
          },
        };
        req.device = device;
        req.device.some_field = true;
        utils.executer(Routes.show.slice(0), req, res);
      });
    });
  });

  describe("#update", function() {
    it("should not allow access to user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      utils.executer(Routes.update.slice(0), req, res);
    });

    describe("operator signed in", function() {
      it("should not allow access", function(done) {
        var req = utils.operatorRequest(),
        res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(401);
            done();
          },
        };
        utils.executer(Routes.update.slice(0), req, res);
      });
    });

    describe("administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = utils.adminRequest();
      });

      it("should update device data", function(done) {
        var res = {
          locals: {},
          json: function(dev) {
            expect(dev._id).toEqual(device._id);
            expect(dev.name).toEqual("Some name");
            expect(dev.some_field).toBeUndefined();
            done();
          },
        };
        req.body = {
          name: "Some name",
          some_field: "mail@mail.com",
        };
        req.device = device;
        utils.executer(Routes.update.slice(0), req, res);
      });

      it("should return 500 if device was not saved", function(done) {
        var res = {
          locals: {},
          json: function(code, err) {
            expect(code).toEqual(500);
            expect(err).toBeTruthy();
            done();
          },
        };
        req.device = device;
        req.body = { name: "" };
        for (var i = 0; i < 55; ++i) {
          req.body += "a";
        }
        utils.executer(Routes.update.slice(0), req, res);
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

    function testCommonBehaviour(reqCreator) {
      var req;

      beforeEach(function() {
        req = reqCreator();
      });

      beforeEach(function(done) {
        createMultipleDevices(50, function() {
          done();
        });
      });

      it("should retrieve first page if not specified", function(done) {
        var res = {
          locals: {},
          json_ng: function(devices) {
            expect(devices.length).toEqual(26);
            expect(devices[25].count).toEqual(51);
            done();
          },
        };
        req.query = {};
        utils.executer(Routes.index.slice(0), req, res);
      });

      it("should sort results by name", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(devices) {
            var fetched = devices.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = {};
        Device.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          original = devices.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should skip pages", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(devices) {
            var fetched = devices.slice(0, 1).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 3 };
        Device.find({}, "_id").sort({name: 1}).skip(50).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          original = devices.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return first page if query is less then 1", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(devices) {
            var fetched = devices.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 0 };
        Device.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          original = devices.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return last page if query page bigger then real count", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(devices) {
            var fetched = devices.slice(0, 1).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 4 };
        Device.find({}, "_id").sort({name: 1}).skip(50).limit(25).exec(function(err, devices) {
          if (err)
            throw err;
          original = devices.map(function(item) { return item._id.toString(); });
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
    it("should authorize user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      utils.executer(Routes.create.slice(0), req, res);
    });

    describe("operator signed in", function() {
      it("should deprecate create  for operator", function(done) {
        var req = utils.operatorRequest(),
        res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(401);
            done();
          },
        };
        utils.executer(Routes.create.slice(0), req, res);
      });
    });

    describe("administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = utils.adminRequest();
      });

      it("should create device with valid params", function(done) {
        var res = {
          locals: {},
          json: function(device) {
            expect(device._id).toBeDefined();
            expect(device.name).toEqual("created device");
            done();
          },
        };
        req.body = {
          name: "created device",
        };
        utils.executer(Routes.create.slice(0), req, res);
      });

      it("should return err with invalid params", function(done) {
        var res = {
          locals: {},
          json: function(code, err) {
            expect(code).toEqual(500);
            expect(err).toBeDefined();
            done();
          },
        };
        req.body = deviceAttrs;
        utils.executer(Routes.create.slice(0), req, res);
      });
    });
  });
});

