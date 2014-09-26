'use strict'
/* test/app/unit/controllers/devices.js -- test Device angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("Device Controllers", function() {
  var httpBackend;

  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  beforeEach(inject(function($httpBackend) {
    httpBackend = $httpBackend;
  }));

  afterEach(function(){
    httpBackend.verifyNoOutstandingExpectation();
  });

  describe("NewDeviceCtrl", function() {
    var scope, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: function() {},
        setNewURL: function() {},
      };
      spyOn(scope, "page");
      spyOn(scope, "setNewURL");
    }));

    it("should call page with params", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should create device", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.device).toBeDefined();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.deviceForm = {
          $setPristine: function() {},
        };
        spyOn(scope.deviceForm, '$setPristine');

        httpBackend.expectPOST('/devices', { name: "hello" }).respond({_id: 2, name: "hello"});
      });

      it("should save device", function() {
        controller('NewDeviceCtrl', { $scope: scope });
        scope.device.name = "hello";
        scope.save();
      });

      it("should clear form", function() {
        controller('NewDeviceCtrl', { $scope: scope });
        scope.device.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(scope.deviceForm.$setPristine).toHaveBeenCalled();
      });

      it("should change location path", function() {
        controller('NewDeviceCtrl', { $scope: scope });
        scope.device.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(location.path()).toEqual('/devices/2');
      });
    });
  });

  describe("DeviceCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: function() {},
        setNewURL: function() {},
        $on: function() {},
      };
      spyOn(scope, "$on");
      spyOn(scope, "page");
      spyOn(scope, "setNewURL");
      routeParams = { deviceId: 2 };
      httpBackend.expectGET('/devices/2').respond({_id: 2, name: "hello"});
      httpBackend.expectGET('/devices/2/setpoints').respond({_id: 2, name: "hello"});
    }));

    it("should call page with params", function() {
      controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).toHaveBeenCalledWith('#/devices/new');
    });

    it("should create device", function() {
      controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.device).toBeDefined();
    });

    it("should create setpoints", function() {
      controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setpoints).toBeDefined();
    });

    describe("load device state", function() {
      beforeEach(function() {
        EventSource = function(url) {
          this.url = url;
          this.addEventListener = jasmine.createSpy();
          this.close = jasmine.createSpy();
        };
      });

      it("should define state", function() {
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        expect(scope.state).toBeDefined();
        expect(scope.state.outputs).toBeDefined();
      });

      it("should connect to event source", function() {
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        expect(scope.stateStream).toBeDefined();
        expect(scope.stateStream.url).toEqual("/devices/2/states?stream=1&interval=10");
      });

      it("should close old stream", function() {
        var oldStream = scope.stateStream = new EventSource("aaaa");
        scope.stateStream.close = jasmine.createSpy();
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        expect(scope.stateStream).toBeDefined();
        expect(scope.stateStream.url).toEqual("/devices/2/states?stream=1&interval=10");
        expect(oldStream.close).toHaveBeenCalled();
      });

      it("should add event listener", function() {
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        expect(scope.stateStream.addEventListener).toHaveBeenCalledWith("message", jasmine.any(Function), false);
      });

      it("should update state when message received", function() {
        scope.$apply = jasmine.createSpy();
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        scope.stateStream.addEventListener.calls[0].args[1]({ data: JSON.stringify({'outputs':{'a1':10}}) });
        expect(scope.$apply).toHaveBeenCalled();
        scope.$apply.calls[0].args[0]();
        expect(scope.state).toBeDefined();
        expect(scope.state.outputs).toBeDefined();
        expect(scope.state.outputs.a1).toEqual(10);
      });

      it("should close stream if location changed", function() {
        var onSpy = jasmine.createSpy();
        scope.$on = jasmine.createSpy().andReturn(onSpy);
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        scope.$on.calls[0].args[1]();
        expect(scope.stateStream.close).toHaveBeenCalled();
        expect(onSpy).toHaveBeenCalled();
      });
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.deviceForm = {};
        scope.deviceForm.$setPristine = jasmine.createSpy();
      });

      it("should save user", function() {
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/devices/2', { _id: 2, name: "world" }).respond({_id: 2, name: "hello"});
        scope.device.name = "world";
        scope.save();
      });

      it("should clear form", function() {
        controller('DeviceCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/devices/2', { _id: 2, name: "world" }).respond({_id: 2, name: "hello"});
        scope.device.name = "world";
        scope.save();
        httpBackend.flush();
        expect(scope.deviceForm.$setPristine).toHaveBeenCalled();
      });
    });
  });

  describe("DevicesCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: function() {},
        setNewURL: function() {},
      };
      spyOn(scope, "page");
      spyOn(scope, "setNewURL");
    }));

    it("should call setNewURL", function() {
      httpBackend.expectGET('/devices?page=1').respond([]);
      controller('DevicesCtrl', { $scope: scope });
      expect(scope.setNewURL).toHaveBeenCalledWith('#/devices/new');
    });

    it("should call page after load devices", function() {
      httpBackend.expectGET('/devices?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('DevicesCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.page).toHaveBeenCalledWith(1, 25, 2);
    });

    it("should fill devices", function() {
      httpBackend.expectGET('/devices?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('DevicesCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.devices.length).toEqual(1);
      expect(scope.devices[0]._id).toEqual(1);
    });

    it("should use page from query params", function() {
      location.search({page: 2});
      httpBackend.expectGET('/devices?page=2').respond([{_id: 1}, { count: 2 }]);
      controller('DevicesCtrl', { $scope: scope });
    });
  });
});

