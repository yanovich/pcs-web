/* test/device_model_test.js -- test Device model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Device = require('../models/device');

var deviceAttrs = { name: "Example Device" }

describe('Device', function () {
  var device;
  beforeEach(function (done) {
    Device.find().remove(done);
    device = new Device(deviceAttrs);
  })

  it('should respond to name', function () {
    expect(device.name).not.to.be.an('undefined');
  });

  it('should be valid', function (done) {
    device.validate(function (err) {
      expect(err).not.to.be.ok;
      done();
    });
  });
  
  describe('when name is not present', function () {
    it('should not be valid', function (done) {
      device.name = " ";
      device.validate(function(err) {
        expect(err).to.be.ok;
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
        expect(err).to.be.ok;
        done();
      });
    });
  })

  describe('when name is already taken', function () {
    it('should not be saved', function (done) {
      device.save(function(err, dev) {
        expect(err).not.to.be.ok;
        device = new Device(deviceAttrs);
        device.save(function(err) {
          expect(err).to.be.ok;
          done();
        });
      });

    });
  })

});
