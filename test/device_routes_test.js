/* test/device_routes_test.js -- test Device routes
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Device = require('../models/device');
var Routes = require('../routes/device');

var deviceAttrs = {
  name: "Some device",
};

describe('Device routes', function() {
  var admin;
  beforeEach(function(done) {
    Device.find().remove(function() {
      (new Device(deviceAttrs)).save(function(err, newDevice) {
        if (err) throw err;
        device = newDevice;
        return done();
      });
    });
  });

  describe("#load", function() {
    it("should find by id and assign device to req", function(done) {
      var req = { },
      id = device._id;

      Routes.load(req, {}, function() {
        expect(req.device.toJSON()).to.eql(device.toJSON());
        done();
      }, id);
    });

    it("should respond with not found code", function(done) {
      var res = {
        send: function(code) {
          expect(code).to.eql(404);
          done();
        }
      };
      Routes.load({}, res, null, 0);
    });
  });
});

// vim:ts=2 sts=2 sw=2 et:
