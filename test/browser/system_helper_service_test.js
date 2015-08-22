/* test/browser/system_helper_service_test.js -- test System Helper Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("SystemHelper Service", function() {
 var service;

  beforeEach(function() {
    service = {};
    service.helper = {};
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('DeviceHelper', service.helper);
    });
  });

  describe("#setDeviceUpdater", function() {
    var scope, $service, httpBackend;
    beforeEach(inject(function(SystemHelper, $httpBackend) {
      scope = { n: {}, system: {} };
      $service = SystemHelper;
      service.helper.loadDeviceState = sinon.spy();
      httpBackend = $httpBackend;
    }));

    it("should define updateDevice", function() {
      $service.setDeviceUpdater(scope);
      expect(scope.updateDevice).to.exist();
    });

    describe("#updateDevice", function() {
      describe("when device not found", function() {
        it ("should do nothing", function() {
          httpBackend.expectGET('/devices?name=a').respond([{count: 0}]);
          $service.setDeviceUpdater(scope);
          scope.n.deviceName = "a";
          scope.updateDevice();
          httpBackend.flush();
          expect(scope.system.device).to.eql(null);
          expect(scope.device).to.eql({});
        });
      });
      describe("when device found", function() {
        beforeEach(function() {
          httpBackend.expectGET('/devices?name=b').respond([{_id: 2, name: "device"}, {count: 1}]);
          scope.$on = sinon.spy();
        });

        it("should assign device", function() {
          $service.setDeviceUpdater(scope);
          scope.n.deviceName = "b";
          scope.updateDevice();
          httpBackend.flush();
          expect(scope.system.device).to.eql(2);
          expect(JSON.stringify(scope.device)).to.eql(JSON.stringify({_id: 2, name: "device"}));
        });

        it("should load device state", function() {
          $service.setDeviceUpdater(scope);
          scope.n.deviceName = "b";
          scope.updateDevice();
          httpBackend.flush();
          expect(service.helper.loadDeviceState).to.have.been.calledWith(scope, 2);
        });
      });
    });
  });
});
