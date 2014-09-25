'use strict'
/* test/backend/models/device.js -- test Device model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var Device = require('../../../models/device');

var deviceAttrs = { name: "Example Device" }

describe('Device', function () {
  var device;
  beforeEach(function (done) {
    device = new Device(deviceAttrs);
    Device.find().remove(done);
  })

  it('should respond to name', function () {
    expect(device.name).toBeDefined();
  });

  it('should be valid', function (done) {
    device.validate(function (err) {
      expect(err).toBeFalsy();
      done();
    });
  });
  
  describe('when name is not present', function () {
    it('should not be valid', function (done) {
      device.name = " ";
      device.validate(function(err) {
        expect(err).toBeTruthy();
        done();
      });
    });
  })

  describe('when name is too long', function () {
    it('should not be valid', function (done) {
      device.name = "";
      for (var i = 0; i < 51; ++i) {
        device.name += "a";
      }
      device.validate(function(err) {
        expect(err).toBeTruthy();
        done();
      });
    });
  })

  describe('when name already exists', function () {
    it('should not save', function (done) {
      device.save(function(err, dev) {
        expect(err).toBeFalsy();
        device = new Device(deviceAttrs);
        device.save(function(err) {
          expect(err).toBeTruthy();;
          done();
        });
      });
      
    });
  })

});

