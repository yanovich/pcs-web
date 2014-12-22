/* test/site_model_test.js -- test Site model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Site = require('../models/site');

var siteAttrs = {
  name: "Site",
};

describe('Site', function () {
  var site;
  before(function (done) {
    site = new Site(siteAttrs);
    done();
  })

  it('should respond to name', function () {
    expect(site.name).not.to.be.an('undefined');
  });
});

// vim:ts=2 sts=2 sw=2 et:
