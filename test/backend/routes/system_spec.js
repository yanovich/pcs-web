'use strict'
/* test/backend/routes/system_spec.js -- test System routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

require('../spec_helper');
var User = require('../../../models/user');
var Site = require('../../../models/site');
var Device = require('../../../models/device');
var System = require('../../../models/system');
var Routes = require('../../../routes/system');
var extend = require('util')._extend;

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

var siteAttrs = {
  name: "Some site",
};

describe('System\'s routes', function() {
  var operator, admin, site, device, system, utils;
  var systemAttrs;

  beforeEach(function(done) {
    systemAttrs = {
      name: "System attributes",
      outputs: [ "Some outputs" ],
      setpoints: {
        d1: 10,
        f3: "DDD",
      },
    };
    (new User(operatorAttrs)).save(function(err, newUser) {
      operator = newUser;
      (new User(adminAttrs)).save(function(err, newAdmin) {
        admin = newAdmin;
        utils = require('./_controller_util')(admin, operator);
        (new Site(siteAttrs)).save(function(err, newSite) {
          site = newSite;
          systemAttrs.site = site._id;
          (new Device(deviceAttrs)).save(function(err, newDevice) {
            device = newDevice;
            systemAttrs.device = device._id;
            (new System(extend({}, systemAttrs))).save(function(err, newSystem) {
              system = newSystem;
              return done();
            });
          });
        });
      });
    });
  });

  afterEach(function(done) {
    System.remove(function() {
      Site.remove(function() {
        Device.remove(function() {
          User.remove(done);
        });
      });
    });
  });

  describe("#load", function() {
    it("should find by id and assign system to req", function(done) {
      var req = { },
      id = system._id;

      Routes.load(req, {}, function() {
        expect(req.system.toJSON()).toEqual(system.toJSON());
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

      it("should return not found if system is not exist", function(done) {
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
          json_ng: function(st) {
            expect(Object.keys(st)).toEqual(['_id', 'device', 'site', 'name', 'outputs', 'setpoints']);
            expect(st._id).toEqual(system._id);
            expect(st.name).toEqual(system.name);
            expect(st.device).toEqual(system.device);
            expect(st.site).toEqual(system.site);
            expect(st.outputs).toEqual(system.outputs);
            expect(st.setpoints).toEqual(system.setpoints);
            done();
          },
        };
        req.system = system;
        req.system.some_field = true;
        utils.executer(Routes.show.slice(0), req, res);
      });
    });

    describe("when administrator logged in", function() {
      var req;

      beforeEach(function() {
        req = utils.adminRequest();
      });

      it("should return not found if system is not exist", function(done) {
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
          json_ng: function(st) {
            expect(Object.keys(st)).toEqual(['_id', 'device', 'site', 'name', 'outputs', 'setpoints']);
            expect(st._id).toEqual(system._id);
            expect(st.name).toEqual(system.name);
            expect(st.device).toEqual(system.device);
            expect(st.site).toEqual(system.site);
            expect(st.outputs).toEqual(system.outputs);
            expect(st.setpoints).toEqual(system.setpoints);
            done();
          },
        };
        req.system = system;
        req.system.some_field = true;
        utils.executer(Routes.show.slice(0), req, res);
      });
    });
  });

  describe("#setpoints", function() {
    it("should return not found if setpoints is not exist", function(done) {
      var res = {
        locals: {},
        send: function(code) {
          expect(code).toEqual(404);
          done();
        },
      }, req = {};
      utils.executer(Routes.setpoints.slice(0), req, res);
    });


    it("should return setpoints by device", function(done) {
      var res = {
        locals: {},
        json: function(st) {
          Object.keys(st).forEach(function(key) {
            expect(st[key]).toEqual(system.setpoints[key]);
          });
          done();
        },
      }, req = {};
      req.device = device;
      utils.executer(Routes.setpoints.slice(0), req, res);
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
      var req;

      beforeEach(function() {
        req = utils.operatorRequest();
      });

      it("should update setpoints data", function(done) {
        var res = {
          locals: {},
          json_ng: function(st) {
            expect(st._id).toEqual(system._id);
            expect(st.name).toEqual(system.name);
            expect(st.device).toEqual(device._id);
            expect(st.site).toEqual(system.site);
            expect(st.outputs).toEqual(system.outputs);
            expect(st.setpoints).toEqual({
              d1: 10,
              f3: "DDD1",
            });
            expect(st.some_field).toBeUndefined();
            done();
          },
        };
        req.body = {
          setpoints: {
            d1: 10,
            f3: "DDD1",
          },
        };
        req.system = system;
        utils.executer(Routes.update.slice(0), req, res);
      });

      it("should return 500 with unchanged", function(done) {
        var res = {
          locals: {},
          send: function(code, err) {
            expect(code).toEqual(500);
            expect(err).toEqual("Unchanged");
            done();
          },
        };
        req.body = {
          setpoints: {
            d1: 10,
            f3: "DDD",
          },
        };
        req.system = system;
        utils.executer(Routes.update.slice(0), req, res);
      });

      it("should return 500 with malformed", function(done) {
        var res = {
          locals: {},
          send: function(code, err) {
            expect(code).toEqual(500);
            expect(err).toEqual("Malformed");
            done();
          },
        };
        req.body = {
          setpoints: {
            d1: 10,
            f3: true,
          },
        };
        req.system = system;
        utils.executer(Routes.update.slice(0), req, res);
      });
    });

    describe("administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = utils.adminRequest();
      });

      it("should update system data", function(done) {
        var res = {
          locals: {},
          json_ng: function(st) {
            expect(st._id).toEqual(system._id);
            expect(st.name).toEqual(system.name);
            expect(st.device).toEqual(device._id);
            expect(st.site).toEqual(system.site);
            expect(st.outputs).toEqual(system.outputs);
            expect(st.setpoints).toEqual({someset: 1});
            expect(st.some_field).toBeUndefined();
            done();
          },
        };
        req.body = system;
        req.system = system;
        req.body.setpoints = { someset: 1 };
        utils.executer(Routes.update.slice(0), req, res);
      });

      it("should return 500 if system was not saved", function(done) {
        var res = {
          locals: {},
          json: function(code, err) {
            expect(code).toEqual(500);
            expect(err).toBeTruthy();
            done();
          },
        };
        req.system = system;
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

    function createMultipleSystems(count, next) {
      var system = {
        name: "system#" + count,
        site: site._id,
        device: device._id,
        outputs: [],
        setpoints: { f: 10 },
      };
      (new System(system)).save(function(err) {
        if (err)
          throw err;
        count -= 1;
        if (count > 0) {
          createMultipleSystems(count, next);
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
        createMultipleSystems(50, function() {
          done();
        });
      });

      it("should retrieve error if site is not specified", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(404);
            done();
          },
        };
        utils.executer(Routes.index.slice(0), req, res);
      });

      it("should retrieve first page if not specified", function(done) {
        var res = {
          locals: {},
          json_ng: function(systems) {
            expect(systems.length).toEqual(26);
            expect(systems[25].count).toEqual(51);
            done();
          },
        };
        req.query = {};
        req.site = site;
        utils.executer(Routes.index.slice(0), req, res);
      });

      it("should sort results by name", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(systems) {
            var fetched = systems.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = {};
        req.site = site;
        System.find({site: site._id}, "_id").sort({name: 1}).limit(25).exec(function(err, systems) {
          if (err)
            throw err;
          original = systems.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should skip pages", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(systems) {
            var fetched = systems.slice(0, 1).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 3 };
        req.site = site;
        System.find({site: site._id}, "_id").sort({name: 1}).skip(50).limit(25).exec(function(err, systems) {
          if (err)
            throw err;
          original = systems.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return first page if query is less then 1", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(systems) {
            var fetched = systems.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 0 };
        req.site = site;
        System.find({site: site._id}, "_id").sort({name: 1}).limit(25).exec(function(err, systems) {
          if (err)
            throw err;
          original = systems.map(function(item) { return item._id.toString(); });
          utils.executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return last page if query page bigger then real count", function(done) {
        var original = [],
        res = {
          locals: {},
          json_ng: function(systems) {
            var fetched = systems.slice(0, 1).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 4 };
        req.site = site;
        System.find({site: site._id}, "_id").sort({name: 1}).skip(50).limit(25).exec(function(err, systems) {
          if (err)
            throw err;
          original = systems.map(function(item) { return item._id.toString(); });
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

      it("should create system with valid params", function(done) {
        var res = {
          locals: {},
          json: function(system) {
            expect(system._id).toBeDefined();
            expect(system.name).toEqual("created system");
            expect(system.device).toEqual(device._id);
            expect(system.site).toEqual(site._id);
            expect(system.outputs.toString()).toBe(["aaaa"].toString());
            expect(system.setpoints).toEqual({a5: 10});
            done();
          },
        };
        req.body = {
          name: "created system",
          device: device._id,
          site: site._id,
          outputs: ["aaaa"],
          setpoints: { a5: 10 },
        };
        req.site = site;
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
        req.body = systemAttrs;
        req.site = site;
        utils.executer(Routes.create.slice(0), req, res);
      });

      it("should return err if site is not specified", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).toEqual(500);
            done();
          },
        };
        req.body = {
          name: "created system",
          device: device._id,
          site: site._id,
          outputs: ["aaaa"],
          setpoints: { a5: 10 },
        };
        utils.executer(Routes.create.slice(0), req, res);
      });
    });
  });
});

