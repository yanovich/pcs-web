'use strict'
/* test/models/user.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var User = require('../../../models/user');
var Routes = require('../../../routes/user');

var operatorAttrs = {
  name: "Example User",
  email: "user@example.com",
  password: 'password',
  confirmation: 'password',
};
var adminAttrs = {
  name: "Example User",
  email: "admin@example.com",
  password: 'password',
  confirmation: 'password',
  admin: true
};

describe('User\'s routes', function() {
  var operator, admin;
  beforeEach(function(done) {
    (new User(operatorAttrs)).save(function(err, newUser) {
      if (err) throw err;
      operator = newUser;
      (new User(adminAttrs)).save(function(err, newAdmin) {
        if (err) throw err;
        admin = newAdmin;
        return done();
      });
    });
  });

  function executer(actions, req, res) {
    if (actions.length == 0)
      return;
    var action = actions.shift(),
    next = function() {
      executer(actions, req, res);
    };
    action(req, res, next);
  };

  function operatorRequest() {
    return {
      session: {
        operatorId: operator._id,
      },
    };
  };

  function adminRequest() {
    return {
      session: {
        operatorId: admin._id,
      },
    };
  };

  describe("#load", function() {
    it("should find by id and assign user to req", function(done) {
      var req = { user: null },
      id = operator._id;

      Routes.load(req, {}, function() {
        expect(req.user.toJSON()).toEqual(operator.toJSON());
        done();
      }, id);
    });

    it("should respond with internal server error if use is not found", function(done) {
      var res = {
        send: function(code, msg) {
          expect(code).toEqual(500);
          expect(msg).toEqual('Sorry, internal server error.');
          done();
        }
      };
      Routes.load({}, res, null, 0);
    });
  });

  describe("#show", function() {
    it("should authorize user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      executer(Routes.show.slice(0), req, res);
    });

    it("should deprecate view other user for operator", function(done) {
      var req = operatorRequest(),
      res = {
        locals: {},
        redirect: function(url) {
          expect(url).toEqual('/users/' + operator._id);
          done();
        },
      };
      req.user = admin;
      executer(Routes.show.slice(0), req, res);
    });

    it("should return 404 is user is not exist", function(done) {
      var req = adminRequest(),
      res = {
        locals: {},
        send: function(code) {
          expect(code).toEqual(404);
          done();
        },
      };
      executer(Routes.show.slice(0), req, res);
    });

    it("should return administrator information", function(done) {
      var req = adminRequest(),
      res = {
        locals: {},
        json_ng: function(user) {
          expect(Object.keys(user)).toEqual(['_id', 'name', 'email', 'admin']);
          expect(user._id).toEqual(admin._id);
          expect(user.name).toEqual(admin.name);
          expect(user.email).toEqual(admin.email);
          expect(user.admin).toEqual(admin.admin);
          done();
        },
      };
      req.user = admin;
      executer(Routes.show.slice(0), req, res);
    });

    it("should return operator information", function(done) {
      var req = operatorRequest(),
      res = {
        locals: {},
        json_ng: function(user) {
          expect(Object.keys(user)).toEqual(['_id', 'name', 'email', 'admin']);
          expect(user._id).toEqual(operator._id);
          expect(user.name).toEqual(operator.name);
          expect(user.email).toEqual(operator.email);
          expect(user.admin).toEqual(operator.admin);
          done();
        },
      };
      req.user = operator;
      executer(Routes.show.slice(0), req, res);
    });
  });

  describe("#update", function() {
    it("should authorize user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      executer(Routes.update.slice(0), req, res);
    });

    describe("operator signed in", function() {
      it("should deprecate update other user for operator", function(done) {
        var req = operatorRequest(),
        res = {
          locals: {},
          redirect: function(url) {
            expect(url).toEqual('/users/' + operator._id);
            done();
          },
        };
        req.user = admin;
        executer(Routes.update.slice(0), req, res);
      });

      it("should update operator data", function(done) {
        var req = operatorRequest(),
        res = {
          locals: {},
          json: function(user) {
            expect(user._id).toEqual(req.session.operatorId);
            expect(user.name).toEqual("Some name");
            expect(user.email).toEqual("mail@mail.com");
            done();
          },
        };
        req.body = {
          name: "Some name",
          email: "mail@mail.com",
          password: "111111111", 
          confirmation: "111111111",
        };
        req.user = operator;
        executer(Routes.update.slice(0), req, res);
      });

      it("should not change admin property for operator", function(done) {
        var req = operatorRequest(),
            res = {
              locals: {},
              json: function(user) {
                expect(user._id).toEqual(req.session.operatorId);
                expect(user.name).toEqual(operator.name);
                expect(user.email).toEqual(operator.email);
                expect(user.admin).toBeFalsy();
                done();
              },
            };
        req.user = operator;
        req.body = {
          name: "Some name",
          email: "mail@mail.com",
          admin: "true"
        };
        executer(Routes.update.slice(0), req, res);
      });

      it("should return error if data is invalid", function(done) {
        var req = operatorRequest(),
        res = {
          locals: {},
          json: function(code, err) {
            expect(code).toEqual(500);
            done();
          },
        };
        req.body = {
          hello: "hello"
        };
        req.user = operator;
        executer(Routes.update.slice(0), req, res);
      });
    });

    describe("administrator signed in", function() {
      it("should update admin data", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json: function(user) {
            expect(user._id).toEqual(req.session.operatorId);
            expect(user.name).toEqual("Some name");
            expect(user.email).toEqual("mail@mail.com");
            done();
          },
        };
        req.body = {
          name: "Some name",
          email: "mail@mail.com",
          password: "111111111", 
          confirmation: "111111111",
        };
        req.user = admin;
        executer(Routes.update.slice(0), req, res);
      });

      it("should not change admin property for administrator", function(done) {
        var req = adminRequest(),
            res = {
              locals: {},
              json: function(user) {
                expect(user._id).toEqual(req.session.operatorId);
                expect(user.name).toEqual(admin.name);
                expect(user.email).toEqual(admin.email);
                expect(user.admin).toBeTruthy();
                done();
              },
            };
        req.user = admin;
        req.body = {
          name: "Some name",
          email: "mail@mail.com",
          admin: "false"
        };
        executer(Routes.update.slice(0), req, res);
      });

      it("should return error if data is invalid", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json: function(code, err) {
            expect(code).toEqual(500);
            done();
          },
        };
        req.body = {
          hello: "hello"
        };
        req.user = admin;
        executer(Routes.update.slice(0), req, res);
      });

      it("can update other users", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json: function(user) {
            expect(user._id).toEqual(operator._id);
            expect(user.name).toEqual("Some name");
            expect(user.email).toEqual("mail@mail.com");
            expect(operator.admin).toBeTruthy();
            done();
          },
        };
        req.body = {
          name: "Some name",
          email: "mail@mail.com",
          admin: "true"
        };
        req.user = operator;
        executer(Routes.update.slice(0), req, res);
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
      executer(Routes.index.slice(0), req, res);
    });

    describe("operator signed in", function() {
      it("should deprecate update other user for operator", function(done) {
        var req = operatorRequest(),
        res = {
          locals: {},
          redirect: function(url) {
            expect(url).toEqual('/users/' + operator._id);
            done();
          },
        };
        req.user = operator;
        executer(Routes.index.slice(0), req, res);
      });
    });

    describe("administrator signed in", function() {
      function createMultipleUsers(count, next) {
        var user = {
          name: "user#" + count,
          email: "email" + count + "@example.com",
          password: "password",
          confirmation: "password",
        };
        (new User(user)).save(function(err) {
          if (err)
            throw "Error";
          count -= 1;
          if (count > 0) {
            createMultipleUsers(count, next);
          } else {
            next();
          }
        });
      }

      beforeEach(function(done) {
        createMultipleUsers(50, function() {
          done();
        });
      });

      it("should retrieve first page if not specified", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json_ng: function(users) {
            expect(users.length).toEqual(26);
            expect(users[25].count).toEqual(52);
            done();
          },
        };
        req.query = {};
        req.user = admin;
        executer(Routes.index.slice(0), req, res);
      });

      it("should sort results by name", function(done) {
        var original = [];
        var req = adminRequest(),
        res = {
          locals: {},
          json_ng: function(users) {
            var fetched = users.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = {};
        req.user = admin;
        User.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          original = users.map(function(item) { return item._id.toString(); });
          executer(Routes.index.slice(0), req, res);
        });
      });

      it("should skip pages", function(done) {
        var original = [];
        var req = adminRequest(),
        res = {
          locals: {},
          json_ng: function(users) {
            var fetched = users.slice(0, 2).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 3 };
        req.user = admin;
        User.find({}, "_id").sort({name: 1}).skip(50).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          original = users.map(function(item) { return item._id.toString(); });
          executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return first page if query is less then 1", function(done) {
        var original = [];
        var req = adminRequest(),
        res = {
          locals: {},
          json_ng: function(users) {
            var fetched = users.slice(0, 25).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 0 };
        req.user = admin;
        User.find({}, "_id").sort({name: 1}).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          original = users.map(function(item) { return item._id.toString(); });
          executer(Routes.index.slice(0), req, res);
        });
      });

      it("should return last page if query page bigger then real count", function(done) {
        var original = [];
        var req = adminRequest(),
        res = {
          locals: {},
          json_ng: function(users) {
            var fetched = users.slice(0, 2).map(function(item) {
              return item._id.toString();
            });
            expect(fetched).toEqual(original);
            done();
          },
        };
        req.query = { page: 4 };
        req.user = admin;
        User.find({}, "_id").sort({name: 1}).skip(50).limit(25).exec(function(err, users) {
          if (err)
            throw err;
          original = users.map(function(item) { return item._id.toString(); });
          executer(Routes.index.slice(0), req, res);
        });
      });
    });
  });

  describe("#create", function() {
    it("should authorize user", function(done) {
      var req = { session: {} },
      res = { redirect: function(url) {
        expect(url).toEqual("/signin");
        done();
      }};
      executer(Routes.create.slice(0), req, res);
    });

    describe("operator signed in", function() {
      it("should deprecate create user for operator", function(done) {
        var req = operatorRequest(),
        res = {
          locals: {},
          redirect: function(url) {
            expect(url).toEqual('/users/' + operator._id);
            done();
          },
        };
        req.user = operator;
        executer(Routes.create.slice(0), req, res);
      });
    });

    describe("administrator signed in", function() {
      it("should create user with valida params", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json: function(user) {
            expect(user._id).toBeDefined();
            expect(user.name).toEqual("created user");
            expect(user.email).toEqual("user.created@example.com");
            done();
          },
        };
        req.body = {
          name: "created user",
          email: "user.created@example.com",
          password: "password",
          confirmation: "password",
        };
        req.user = admin;
        executer(Routes.create.slice(0), req, res);
      });

      it("should return err with invalid params", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json: function(code, err) {
            expect(code).toEqual(500);
            expect(err).toBeDefined();
            done();
          },
        };
        req.body = operatorAttrs;
        req.user = admin;
        executer(Routes.create.slice(0), req, res);
      });

      it("should create admin", function(done) {
        var req = adminRequest(),
        res = {
          locals: {},
          json: function(user) {
            expect(user._id).toBeDefined();
            expect(user.name).toEqual("created user");
            expect(user.email).toEqual("user.created@example.com");
            expect(user.admin).toBeTruthy();
            done();
          },
        };
        req.body = {
          name: "created user",
          email: "user.created@example.com",
          admin: true,
          password: "password",
          confirmation: "password",
        };
        req.user = admin;
        executer(Routes.create.slice(0), req, res);
      });
    });
  });
});

