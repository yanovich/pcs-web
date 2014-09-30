'use strict'
/* test/app/unit/services/site.js -- test Site Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("Site Service", function() {
  var service;

  beforeEach(function() {
    service = {};
    service.resource = function() {};
    spyOn(service, 'resource');
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('$resource', service.resource);
    });
  });

  it("should create resource", function() {
    inject(function(Site) {
      expect(service.resource).toHaveBeenCalledWith('/sites/:siteId', { siteId: '@_id' });
    });
  });
});


