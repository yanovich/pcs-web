/* test/browser/site_service_test.js -- test Site Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("Site Service", function() {
  var service;

  beforeEach(function() {
    service = {};
    service.resource = sinon.spy();
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('$resource', service.resource);
    });
  });

  it("should create resource", function() {
    inject(function(Site) {
      expect(service.resource).to.have.been.calledWith('/sites/:siteId', { siteId: '@_id' });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
