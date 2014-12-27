/* test/site_routes_test.js -- test Site routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Routes = require('../routes/site');
var router = require('./support/router');
var Site = require('../models/site');

var siteAttrs = {
  name: "Some site",
};

describe('Site routes', function() {
  var site, count, last;
  before(function(done) {
    Factory.create('site', 26, function (l) {
      site = l[0];
      Site.count(function (err, c) {
        if (err) throw err;
        count = c;
        last = Math.floor((count + 24) / 25);
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
    it("should find by id and assign site to req", function(done) {
      var req = { },
      id = site._id;

      Routes.load(req, {}, function() {
        expect(req.site.toJSON()).to.eql(site.toJSON());
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
          json_ng: function(st) {
            expect(Object.keys(st)).to.eql(['_id', 'name']);
            expect(st._id).to.eql(site._id);
            expect(st.name).to.eql(site.name);
            done();
          },
        };
        req.site = site;
        req.site.some_field = true;
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
        req.site = site;
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
        res.json_ng = function(sites) {
          expect(sites.length).to.be(26);
          expect(sites[25].count).to.be(count);
          done();
        };
        router(Routes.index, req, res);
      });

      it("should sort results by name", function(done) {
        var original = [];
        res.json_ng = function(sites) {
          var fetched = sites.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        Site.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, sites) {
          original = sites.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve requested page", function(done) {
        var original = [];
        res.json_ng = function(sites) {
          var fetched = sites.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = last;
        Site.find({}, "_id").sort({name: 1}).skip(25).limit(25).exec(function(err, sites) {
          original = sites.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve first one if page is less then 1", function(done) {
        var original = [];
        res.json_ng = function(sites) {
          var fetched = sites.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        Site.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, sites) {
          original = sites.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve last one if page is too big", function(done) {
        var original = [];
        res.json_ng = function(sites) {
          var fetched = sites.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = last + 1;
        Site.find({}, "_id").sort({name: 1}).skip((last -1) * 25).limit(25).exec(function(err, sites) {
          original = sites.map(function(item) { return item._id.toString(); });
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
        router(Routes.create, req, res);
      });
    });

    describe("when administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operatorId: admin._id } };
        res = {
          locals: {},
        };
      });

      it("should create site with valid params", function(done) {
        req.body = {
          name: 'created site',
        }
        res.json = function(site) {
          expect(site._id).not.to.be.an('undefined');
          expect(site.name).to.be(req.body.name);
          done();
        };
        router(Routes.create, req, res);
      });

      it("should fail when name is already taken", function(done) {
        req.body = {
          name: site.name,
        }
        res.json = function(code, err) {
          expect(code).to.be(500);
          expect(err).not.to.be.an('undefined');
          done();
        };
        router(Routes.create, req, res);
      });

      it("should report when name is already taken");
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:

