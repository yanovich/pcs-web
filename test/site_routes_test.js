/* test/site_routes_test.js -- test Site routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Routes = require('../routes/site');

var siteAttrs = {
  name: "Some site",
};

describe('Site routes', function() {
  var site;
  before(function(done) {
    Factory.create('site', function (s) { site = s; done(); });
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
  });
});

// vim:ts=2 sts=2 sw=2 et:

