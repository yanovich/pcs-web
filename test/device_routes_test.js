/* test/device_routes_test.js -- test Device routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Device = require('../models/device');
var Routes = require('../routes/device');
var router = require('./support/router');

var deviceAttrs = {
  name: "Some device",
};

describe('Device routes', function() {
  var device, count;
  before(function(done) {
    Factory.create('device', 26, function (l) {
      device = l[0];
      Device.count(function (err, c) {
        if (err) throw err;
        count = c;
        done();
      });
    });
  });

  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  var admin;
  before(function(done) {
    Factory.create('admin', function (a) { admin = a; done(); });
  });

  describe("#load", function() {
    it("should find by id and assign device to req", function(done) {
      var req = { },
      id = device._id;

      Routes.load(req, {}, function() {
        expect(req.device.toJSON()).to.eql(device.toJSON());
        done();
      }, id);
    });

    it("should respond with not found code", function(done) {
      var res = {
        send: function(code) {
          expect(code).to.eql(404);
          done();
        }
      };
      Routes.load({}, res, null, 0);
    });
  });

  describe("#show", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.show, req, res);
    });

    describe("when operator logged in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
      });

      it("should return 404 if no device", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(404);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(dev) {
            expect(Object.keys(dev)).to.eql(['_id', 'name']);
            expect(dev._id).to.eql(device._id);
            expect(dev.name).to.eql(device.name);
            done();
          },
        };
        req.device = device;
        req.device.some_field = true;
        router(Routes.show, req, res);
      });
    });
  });

  describe("#update", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.update, req, res);
    });

    describe("when operator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
      });

      it("should deny non-admins", function(done) {
        res = {
          locals: {},
          send: function(code) {
            expect(code).to.eql(403);
            done();
          },
        };
        router(Routes.update, req, res);
      });
    });

    describe("when administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: admin._id } };
      });

      it("should fail", function(done) {
        var res = {
          locals: {},
          json: function(code) {
            expect(code).to.eql(500);
            done();
          },
        };
        req.body = {
          name: "Some name",
        };
        req.device = device;
        router(Routes.update, req, res);
      });
    });
  });

  describe("#index", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.index, req, res);
    });

    describe("when operator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: operator._id } };
        req.query = {};
        res = {
          locals: {},
        };
      });

      it("should retrieve first page if not specified", function(done) {
        res.json_ng = function(devices) {
          expect(devices.length).to.be(26);
          expect(devices[25].count).to.be(count);
          done();
        };
        router(Routes.index, req, res);
      });

      it("should sort results by name", function(done) {
        var original = [];
        res.json_ng = function(devices) {
          var fetched = devices.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        Device.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, devices) {
          original = devices.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve requested page", function(done) {
        var original = [];
        res.json_ng = function(devices) {
          var fetched = devices.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = 2;
        Device.find({}, "_id").sort({name: 1}).skip(25).limit(25).exec(function(err, devices) {
          original = devices.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve first one if page is less then 1", function(done) {
        var original = [];
        res.json_ng = function(devices) {
          var fetched = devices.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = 0;
        Device.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, devices) {
          original = devices.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve last one if page is too big", function(done) {
        var original = [];
        res.json_ng = function(devices) {
          var fetched = devices.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = 3;
        Device.find({}, "_id").sort({name: 1}).skip(25).limit(25).exec(function(err, devices) {
          original = devices.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });
    });
  });

  describe("#create", function() {
    it("should deny access to non-signed-in users", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).to.eql("/signin");
        done();
      }};
      router(Routes.index, req, res);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
