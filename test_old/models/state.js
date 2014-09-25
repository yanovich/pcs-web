/* test/models/state.js -- test State model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var State = require('../../models/state');

var stateAttrs = { content: "Example State" }

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

  it('should respond to content', function () {
    expect(state.content).not.to.be.an('undefined');
  });

  it('should respond to device', function () {
    expect(state.device).not.to.be.an('undefined');
  });
});

// vim:ts=2 sts=2 sw=2 et:
