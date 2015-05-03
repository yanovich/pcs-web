/* test/user_routes_test.js -- test User routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

var expect = require('expect.js');

var User = require('../models/user');
var Routes = require('../routes/user');
var router = require('./support/router');

describe('User routes', function() {
  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  var admin;
  before(function(done) {
    Factory.create('admin', function (u) { admin = u; done(); });
  });

  var user, count, last;
  before(function(done) {
    Factory.create('user', 26, function (l) {
      user = l[0];
      User.count(function (err, c) {
        if (err) throw err;
        count = c;
        last = Math.floor((count + 24) / 25);
        done();
      });
    });
  });

  describe("#load", function() {
    it("should find by id and assign user to req", function(done) {
      var req = { user: null },
      id = user._id;

      Routes.load(req, {}, function() {
        expect(req.user.toJSON()).to.eql(user.toJSON());
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
        req = { session: { operator: operator.email } };
      });

      it("should return 404 if no user", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(404);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should deny others profiles to non-admin", function(done) {
        req.user = user;
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.be(403);
            done();
          },
        };
        router(Routes.show, req, res);
      });

      it("should return only accessible fields", function(done) {
        var res = {
          locals: {},
          json_ng: function(u) {
            expect(Object.keys(u)).to.eql(['_id', 'name', 'email', 'admin']);
            expect(u._id).to.eql(operator._id);
            expect(u.name).to.eql(operator.name);
            expect(u.email).to.eql(operator.email);
            expect(u.admin).to.eql(operator.admin);
            done();
          },
        };
        req.user = operator;
        req.user.some_field = true;
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
        req = { session: { operator: operator.email } };
      });

      it("should deny non-admins", function(done) {
        var res = {
          locals: {},
          send: function(code) {
            expect(code).to.eql(403);
            done();
          },
        };
        req.user = user;
        router(Routes.update, req, res);
      });

      it("should modify own name", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              operator.name = req.body.name;
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: "update.operator",
        };
        router(Routes.update, req, res);
      });

      it("should not modify admin status", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(operator.admin);
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: operator.name,
          admin: 1,
        };
        router(Routes.update, req, res);
      });

      it("should not modify email", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u).not.to.be(500);
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              expect(u.email).to.eql(operator.email);
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(operator.admin);
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: 'new_user@example.com',
          name: operator.name,
        };
        router(Routes.update, req, res);
      });

      it("should modify own password", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              operator.authenticate(req.body.password, function (err, valid) {
                if (err) throw err;
                expect(valid).to.be.okt;
              });
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: operator.name,
          password: "1111111",
          confirmation: "1111111",
        };
        router(Routes.update, req, res);
      });

      it("should match password to confirmation", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: operator.email }, function (err, u) {
              if (err) throw err;
              operator.authenticate(req.body.password, function (err, valid) {
                if (err) throw err;
                expect(valid).not.to.be.ok;
              });
              done();
            });
          },
        };
        req.user = operator;
        req.body = {
          email: operator.email,
          name: operator.name,
          password: "1111111",
          confirmation: "1111112",
        };
        router(Routes.update, req, res);
      });

      it("should report validation errors");
    });

    describe("when administrator signed in", function() {
      var req;

      beforeEach(function() {
        req = { session: { operator: admin.email } };
      });

      it("should modify own name", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: admin.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              admin.name = req.body.name;
              expect(u.admin).to.eql(admin.admin);
              done();
            });
          },
        };
        req.user = admin;
        req.body = {
          email: admin.email,
          name: 'update admin',
          admin: true,
        };
        router(Routes.update, req, res);
      });

      it("should not modify own admin status", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: admin.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(admin.admin);
              done();
            });
          },
        };
        req.user = admin;
        req.body = {
          email: admin.email,
          name: admin.name,
          admin: false,
        };
        router(Routes.update, req, res);
      });

      it("should modify user names", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: user.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              user.name = req.body.name;
              expect(u.admin).to.eql(user.admin);
              done();
            });
          },
        };
        req.user = user;
        req.body = {
          email: user.email,
          name: 'update.user',
          admin: user.admin,
        };
        router(Routes.update, req, res);
      });

      it("should not modify user emails", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: user.email }, function (err, u) {
              if (err) throw err;
              expect(u.name).to.eql(req.body.name);
              expect(u.admin).to.eql(user.admin);
              done();
            });
          },
        };
        req.user = user;
        req.body = {
          email: 'new_user@example.com',
          name: user.name,
          admin: user.admin,
        };
        router(Routes.update, req, res);
      });

      it("should modify user passwords", function(done) {
        var res = {
          locals: {},
          json: function(u) {
            expect(u.name).to.eql(req.body.name);
            User.findOne({ email: user.email }, function (err, u) {
              if (err) throw err;
              operator.authenticate(req.body.password, function (err, valid) {
                if (err) throw err;
                expect(valid).to.be.ok;
              });
              done();
            });
          },
        };
        req.user = user;
        req.body = {
          email: user.email,
          name: user.name,
          password: "1111111",
          confirmation: "1111111",
        };
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

    it("should deny access to non-admin users", function(done) {
      var req = { session: { operator: operator.email } },
      res = {
        locals: {},
        send: function(code) {
          expect(code).to.eql(403);
          done();
        },
      };
      router(Routes.index, req, res);
    });

    describe("when administrator signed in", function() {
      var req, res;

      beforeEach(function() {
        req = { session: { operator: admin.email } };
        req.query = {};
        res = {
          locals: {},
        };
      });

      it("should retrieve first page if not specified", function(done) {
        res.json_ng = function(users) {
          expect(users.length).to.be(26);
          expect(users[25].count).to.be(count);
          done();
        };
        router(Routes.index, req, res);
      });

      it("should sort results by name", function(done) {
        var original = [];
        res.json_ng = function(users) {
          var fetched = users.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        User.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, users) {
          original = users.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve requested page", function(done) {
        var original = [];
        res.json_ng = function(users) {
          var fetched = users.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = 2;
        User.find({}, "_id").sort({name: 1}).skip(25).limit(25).exec(function(err, users) {
          original = users.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve first one if page is less then 1", function(done) {
        var original = [];
        res.json_ng = function(users) {
          var fetched = users.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = 0;
        User.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, users) {
          original = users.map(function(item) { return item._id.toString(); });
          router(Routes.index, req, res);
        });
      });

      it("should retrieve last one if page is too big", function(done) {
        var original = [];
        res.json_ng = function(users) {
          var fetched = users.slice(0, -1).map(function(item) {
            return item._id.toString();
          });
          expect(fetched).to.eql(original);
          done();
        };
        req.query.page = last + 1;
        User.find({}, "_id").sort({name: 1}).skip((last - 1) * 25).limit(25).exec(function(err, users) {
          original = users.map(function(item) { return item._id.toString(); });
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
      router(Routes.create, req, res);
    });

    it("should deny access to non-admin users", function(done) {
      var req = { session: { operator: operator.email } },
      res = {
        locals: {},
        send: function(code) {
          expect(code).to.eql(403);
          done();
        },
      };
      router(Routes.create, req, res);
    });

    describe("when administrator signed in", function() {
      var req, res;

      beforeEach(function() {
        req = { session: { operator: admin.email } };
        res = {
          locals: {},
        };
      });

      it("should create user with valid params", function(done) {
        req.body = {
          name: 'created user',
          email: 'created.user@example.com',
          password: '12345678',
          confirmation: '12345678',
        };
        res.json = function(u) {
          expect(u._id).not.to.be.an('undefined');
          expect(u.name).to.be(req.body.name);
          expect(u.email).to.be(req.body.email);
          User.findOne({ _id: u._id }, function (err, z) {
            expect(err).not.to.be.ok;
            expect(z).to.be.ok;
            expect(z.name).to.be(req.body.name);
            expect(z.email).to.be(req.body.email);
            done();
          });
        };
        router(Routes.create, req, res);
      });

      it("should fail when name is already taken", function(done) {
        req.body = {
          name: 'created user',
          email: user.email,
          password: '12345678',
          confirmation: '12345678',
        }
        res.json = function(code, err) {
          expect(code).to.be(500);
          expect(err).not.to.be.an('undefined');
          done();
        };
        router(Routes.create, req, res);
      });

      it("should report validation errors");
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
