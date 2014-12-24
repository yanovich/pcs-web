/* test/session_routes_test.js -- test Session routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var sinon = require('sinon');
expect = require('sinon-expect').enhance(expect, sinon, 'was');
var Routes = require('../routes/session');
var router = require('./support/router');

describe('Session routes', function() {
  var operator;
  before(function(done) {
    Factory.create('user', function (u) { operator = u; done(); });
  });

  describe("#new", function() {
    it("should render signin html if no session", function() {
      var req = { session: {} },
          res = { render: sinon.spy() };

      Routes.new(req, res);
      expect(res.render).was.calledWith("sessions/new", {title: 'Sign in'});
    });

    it("should render signin html if missing user", function(done) {
      var id = "507f1f77bcf86cd799439011";
      var req = { session: { operatorId: id } },
      res = { render: function(path, options) {
        expect(path).to.eql("sessions/new");
        expect(options).to.eql({title:'Sign in'});
        expect(req.session.operatorId).to.be.an('undefined');
        done();
      }};

      Routes.new(req, res);
    });

    it("should render signin html if bad user", function(done) {
      var id = "bad";
      var req = { session: { operatorId: id } },
      res = { render: function(path, options) {
        expect(path).to.eql("sessions/new");
        expect(options).to.eql({title:'Sign in'});
        expect(req.session.operatorId).to.be.an('undefined');
        done();
      }};

      Routes.new(req, res);
    });

    it("should redirect to / if good user", function(done) {
      var req = { session: { operatorId: operator._id } },
      res = { redirect: function(path) {
        expect(path).to.eql("/");
        done();
      }};

      Routes.new(req, res);
    });
  });

  describe("#create", function() {
    it("should fail if email is unknown", function(done) {
      var req = { body: { email: 'nouser@example.com' } },
          res = {
            locals: {},
            render: function(path, options) {
              expect(path).to.eql("sessions/new");
              expect(options).to.eql({title:'Sign in'});
              expect(res.locals).to.eql({
                err: { errors: { password: { type: 'signin' } } }
              });
              done();
            }
          };

      router(Routes.create, req, res);
    });

    it("should fail if no password", function(done) {
      var req = { body: { email: operator.email } },
          res = {
            locals: {},
            render: function(path, options) {
              expect(path).to.eql("sessions/new");
              expect(options).to.eql({title:'Sign in'});
              expect(res.locals).to.eql({
                err: { errors: { password: { type: 'signin' } } }
              });
              done();
            }
          };

      router(Routes.create, req, res);
    });

    it("should fail if bad password", function(done) {
      var req = { body: { email: operator.email, password: 'a' } },
          res = {
            locals: {},
            render: function(path, options) {
              expect(path).to.eql("sessions/new");
              expect(options).to.eql({title:'Sign in'});
              expect(res.locals).to.eql({
                err: { errors: { password: { type: 'signin' } } }
              });
              done();
            }
          };

      router(Routes.create, req, res);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
