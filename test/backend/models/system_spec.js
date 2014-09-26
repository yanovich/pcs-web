'use strict'
/* test/backend/models/system_spec.js -- test System model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var Site = require('../../../models/site');
var Device = require('../../../models/device');
var System = require('../../../models/system');

var deviceAttrs = {
  name: "Device"
};

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

describe('Device', function() {
  var system;
  beforeEach(function(done) {
    Device.create(deviceAttrs, function(err, device) {
      Site.create(siteAttrs, function(err, site) {
        systemAttrs.device = device._id;
        systemAttrs.site = site._id;
        system = new System(systemAttrs);
        return done();
      });
    });
  });

  describe("#scheme", function() {
    it('should respond to device', function () {
      expect(system.device).toBeDefined();
    });

    it('should respond to site', function () {
      expect(system.site).toBeDefined();
    });

    it('should respond to name', function () {
      expect(system.name).toBeDefined();
    });

    it('should respond to outputs', function () {
      expect(system.outputs).toBeDefined();
    });

    it('should respond to setpoints', function () {
      expect(system.setpoints).toBeDefined();
    });
  });

  describe("#validate", function() {
    it('should be valid', function (done) {
      system.validate(function (err) {
        expect(err).toBeFalsy();
        done();
      });
    });

    describe('when name is not present', function () {
      it('should not be valid', function (done) {
        system.name = " ";
        system.validate(function(err) {
          expect(err).toBeTruthy();
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
          expect(err).toBeTruthy();
          done();
        });
      });
    });

    describe('when device is not present', function () {
      it('should not be valid', function (done) {
        system.device = null;
        system.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    });
    describe('when site is not present', function () {
      it('should not be valid', function (done) {
        system.site = null;
        system.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    });
  });
});

