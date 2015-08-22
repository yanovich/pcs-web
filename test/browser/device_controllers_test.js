/* test/browser/device_controllers_test.js -- test Device angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict'

describe("Device Controllers", function() {
  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  var httpBackend;

  beforeEach(inject(function($httpBackend) {
    httpBackend = $httpBackend;
  }));

  afterEach(function(){
    httpBackend.verifyNoOutstandingExpectation();
  });

  var location, controller;
  beforeEach(inject(function($location, $controller) {
    location = $location;
    controller = $controller;
  }));

  describe("NewDeviceCtrl", function() {
    var scope;

    beforeEach(function() {
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    });

    it("should clear pager", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should clear setNewURL", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.setNewURL).to.have.been.calledWith(null);
    });

    it("should create device in scope", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.device).to.exist();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.deviceForm = {
          $setPristine: sinon.spy(),
        };

        httpBackend.expectPOST('/devices', { name: "hello" }).respond({_id: 2, name: "hello"});
        controller('NewDeviceCtrl', { $scope: scope });
        scope.device.name = "hello";
      });

      it("should save device", function() {
        scope.save();
      });

      it("should set the form pristine", function() {
        scope.save();
        httpBackend.flush();
        expect(scope.deviceForm.$setPristine).to.have.been.called;
      });

      it("should change location path", function() {
        scope.save();
        httpBackend.flush();
        expect(location.path()).to.equal('/devices/2');
      });
    });
  });

  describe("DevicesCtrl", function() {
    var scope;

    beforeEach(function() {
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    });

    describe("first page", function() {
      beforeEach(function() {
        httpBackend.expectGET('/devices?page=1').respond([{_id: 1}, {_id: 2}, {count: 2}]);
        controller('DevicesCtrl', { $scope: scope });
      });

      it("should setup pager", function() {
        httpBackend.flush();
        expect(scope.page).to.have.been.calledWith(1, 25, 2);
      });

      it("should call setNewURL", function() {
        expect(scope.setNewURL).to.have.been.calledWith('#/devices/new');
      });

      it("should fill devices", function() {
        httpBackend.flush();
        expect(scope.devices.length).to.equal(2);
        expect(scope.devices[0]._id).to.equal(1);
      });
    });

    describe("second page", function() {
      beforeEach(function() {
        location.search({page: 2});
        httpBackend.expectGET('/devices?page=2').respond([{_id: 26}, {_id: 27}, {count: 2}]);
        controller('DevicesCtrl', { $scope: scope });
      });

      it("should setup pager", function() {
        httpBackend.flush();
        expect(scope.page).to.have.been.calledWith(2, 25, 2);
      });
    });
  });

  describe("DeviceCtrl", function() {
    var scope, routeParams, deviceHelper;

    beforeEach(function() {
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
        $on: sinon.spy(),
      };
      routeParams = { deviceId: 2 };
      deviceHelper = { loadDeviceState: sinon.spy() };
      httpBackend.expectGET('/devices/2').respond({_id: 2, name: "hello"});
      httpBackend.expectGET('/devices/2/setpoints').respond({a: 1, b: 2});
      controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams, DeviceHelper: deviceHelper });
    });

    it("should clear pager", function() {
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      expect(scope.setNewURL).to.have.been.calledWith('#/devices/new');
    });

    it("should load device", function() {
      httpBackend.flush();
      expect(scope.device).to.exist();
      expect(scope.device._id).to.equal(2);
      expect(scope.device.name).to.equal("hello");
    });

    it("should load setpoints", function() {
      httpBackend.flush();
      expect(scope.setpoints).to.exist();
      expect(scope.setpoints.a).to.equal(1);
    });

    it("should load device state", function() {
      expect(deviceHelper.loadDeviceState).to.have.been.calledWith(scope, 2);
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.deviceForm = {};
        scope.deviceForm.$setPristine = sinon.spy();

        httpBackend.flush();
        httpBackend.expectPOST('/devices/2', { _id: 2, name: "world" }).respond({_id: 2, name: "world"});
        scope.device.name = "world";
        scope.save();
        httpBackend.flush();
      });

      it("should save device", function() {
        expect(scope.device.name).to.equal("world");
      });

      it("should set the form pristine", function() {
        expect(scope.deviceForm.$setPristine).to.have.been.called;
      });
    });
  });
});
