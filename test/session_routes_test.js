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

describe('Session routes', function() {
  describe("#new", function() {
    it("should render signin html if no session", function() {
      var req = { session: {} },
          res = { render: sinon.spy() };

      Routes.new(req, res);
      expect(res.render).was.calledWith("sessions/new", {title: 'Sign in'});
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
