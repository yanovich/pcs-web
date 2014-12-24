/* test/auth_route_spec.js -- test Authentication helper
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Routes = require('../routes/_auth');

describe('Authentication helper', function() {
  describe("#authenticate", function() {
    it("should redirect to signin if session is not inited", function(done) {
      var req = { session: {}, url: "someurl" },
          res = { redirect: function(url) {
            expect(url).to.eql("/signin");
            done();
          }};

      Routes.authenticate(req, res, null);
    });

    it("should return 500 code if user is not found", function(done) {
      var req = { session: { operatorId: 2220 } },
          res = { send: function(code, msg) {
            expect(code).to.eql(500);
            expect(msg).to.eql('Sorry, internal server error.');
            done();
          }};

      Routes.authenticate(req, res, null);
    });
  });
});


// vim:ts=2 sts=2 sw=2 et:

