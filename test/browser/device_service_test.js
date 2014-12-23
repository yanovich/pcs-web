/* test/browser/device_service_test.js -- test Device Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict'

describe("Device Service", function() {
  var resource;

  beforeEach(function() {
    resource = sinon.spy();
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('$resource', resource);
    });
  });

  it("should create resource", function() {
    inject(function(Device) {
      expect(resource).to.have.been.calledWith('/devices/:deviceId', { deviceId: '@_id' });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
