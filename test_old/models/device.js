/* test/models/device.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Device = require('../../models/device');

var deviceAttrs = { name: "Example Device", filepath: "/dev/null" }

describe('Device', function () {
  var device;
  beforeEach(function (done) {
    Device.find().remove(done);
    device = new Device(deviceAttrs);
  })

  it('should respond to name', function () {
    expect(device.name).not.to.be.an('undefined');
  });

  it('should respond to filepath', function () {
    expect(device.filepath).not.to.be.an('undefined');
  });

  it('should respond to enabled', function () {
    expect(device.enabled).not.to.be.an('undefined');
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
  
  describe('when filepath is not present', function () {
    it('should not be valid', function (done) {
      device.filepath = " ";
      device.validate(function(err) {
        expect(err).to.be.ok;
        done();
      });
    });
  })
});

// vim:ts=2 sts=2 sw=2 et:
