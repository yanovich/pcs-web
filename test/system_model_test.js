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

  it('should respond to site', function () {
    expect(system.site).not.to.be.an('undefined');
  });

  it('should respond to name', function () {
    expect(system.name).not.to.be.an('undefined');
  });

  it('should respond to outputs', function () {
    expect(system.outputs).not.to.be.an('undefined');
  });

  it('should respond to setpoints', function () {
    expect(system.setpoints).not.to.be.an('undefined');
  });

  it('should be valid', function (done) {
    system.validate(function (err) {
      expect(err).to.be.an('undefined');
      done();
    });
  });

  describe('when name is not present', function () {
    it('should not be valid', function (done) {
      system.name = " ";
      system.validate(function(err) {
        expect(err).not.to.be.an('undefined');
        done();
      });
    });
  });

  describe('when name is too long', function () {
    it('should not be valid', function (done) {
      var name = "";
      for (var i = 0; i < 51; i++)
      name += 'a';
      system.name = name;
      system.validate(function(err) {
        expect(err).not.to.be.an('undefined');
        done();
      });
    });
  });

  describe('when device is not present', function () {
    it('should not be valid', function (done) {
      system.device = null;
      system.validate(function(err) {
        expect(err).not.to.be.an('undefined');
        done();
      });
    });
  });

  describe('when site is not present', function () {
    it('should not be valid', function (done) {
      system.site = null;
      system.validate(function(err) {
        expect(err).not.to.be.an('undefined');
        done();
      });
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
