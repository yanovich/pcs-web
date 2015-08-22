/* test/browser/state_service_test.js -- test State Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("State Service", function() {
  var service;

  beforeEach(function() {
    service = {};
    service.resource = sinon.spy();
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('$resource', service.resource);
    });
  });

  it("should create resource", function() {
    inject(function(State) {
      expect(service.resource).to.have.been.calledWith('/devices/:deviceId/states/:stateId', { deviceId: '@device', stateId: '@_id' });
    });
  });
});
