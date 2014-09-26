'use strict'
/* test/backend/models/state_spec.js -- test State model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var State = require('../../../models/state');
var Device = require('../../../models/device');

var deviceAttrs = {
  name: "Device"
};

var stateAttrs = {
  device: null,
  stamp: new Date(),
  outputs: {
    m1: 1000,
    g2: "ggg",
  },
};

describe('Device', function() {
  var state;
  beforeEach(function(done) {
    Device.create(deviceAttrs, function(err, device) {
      stateAttrs.device = device._id;
      state = new State(stateAttrs);
      return done();
    });
  });

  describe("#scheme", function() {
    it('should respond to device', function () {
      expect(state.device).toBeDefined();
    });

    it('should respond to stamp', function () {
      expect(state.stamp).toBeDefined();
    });

    it('should respond to outputs', function () {
      expect(state.outputs).toBeDefined();
    });
  });

  describe("#validate", function() {
    it('should be valid', function (done) {
      state.validate(function (err) {
        expect(err).toBeFalsy();
        done();
      });
    });
  });
});



