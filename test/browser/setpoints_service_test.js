/* test/browser/setpoints_service_test.js -- test Device Setpoints Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("Setpoints Service", function() {
  var resource;

  beforeEach(function() {
    resource = sinon.spy();
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('$resource', resource);
    });
  });

  it("should create resource", function() {
    inject(function(Setpoints) {
      expect(resource).to.have.been.calledWith('/devices/:deviceId/setpoints');
    });
  });
});
