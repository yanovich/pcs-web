/* test/state_routes_test.js -- test State routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

var expect = require('expect.js');

var Routes = require('../routes/state');
var router = require('./support/router');

describe('State routes', function () {
  describe("#index", function() {
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
