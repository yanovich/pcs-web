/* test/state_model_test.js -- test State model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var State = require('../models/state');

var stateAttrs = {
  stamp: new Date(),
  outputs: {
    m1: 1000,
    g2: "ggg",
  }
}

describe('State', function () {
  var state;
  var device;
  before(function (done) {
    Factory.create('device', function (d) { device = d; done(); });
  })

  before(function (done) {
    State.find().remove(function () {
      state = new State(stateAttrs);
      state.device = device._id;
      done();
    })
  })

  it('should respond to device', function () {
    expect(state.device).not.to.be.an('undefined');
  });

  it('should respond to stamp', function () {
    expect(state.stamp).not.to.be.an('undefined');
  });

  it('should respond to outputs', function () {
    expect(state.outputs).not.to.be.an('undefined');
  });

  it('should be valid', function (done) {
    state.validate(function (err) {
      expect(err).not.to.be.ok;
      done();
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
