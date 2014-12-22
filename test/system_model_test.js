/* test/system_model_test.js -- test System model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Site = require('../models/site');
var Device = require('../models/device');
var System = require('../models/system');

var siteAttrs = {
  name: "Site"
};

var systemAttrs = {
  device: null,
  site: null,
  name: "some system",
  outputs: ["Some string", "Some second string"],
  setpoints: {
    m1: 1000,
    g2: "ggg",
  },
};

describe('System', function() {
  var system;
  before(function (done) {
    Factory.create('device', function (d) { device = d; done(); });
  })

  before(function (done) {
    Site.find().remove(function() {
      Site.create(siteAttrs, function(err, site) {
        systemAttrs.device = device._id;
        systemAttrs.site = site._id;
        system = new System(systemAttrs);
        done();
      });
    });
  })

  it('should respond to device', function () {
    expect(system.device).not.to.be.an('undefined');
  });
});

// vim:ts=2 sts=2 sw=2 et: