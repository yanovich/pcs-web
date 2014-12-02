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

  describe("NewSystemCtrl", function() {
    var scope, location, controller, routeParams;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      routeParams = { siteId: 2 };
      scope = {
        page: function() {},
        setNewURL: function() {},
      };
      spyOn(scope, "page");
      spyOn(scope, "setNewURL");
      httpBackend.expectGET('/sites/2').respond({_id: 2, name: "site"});
    }));

    it("should call page with params", function() {
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should create system", function() {
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.system).toBeDefined();
      expect(scope.system.site).toEqual(2);
    });

    it("should load site", function() {
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.site).toBeDefined();
    });

    it("should create n", function() {
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.n).toEqual({ deviceName: "" });
    });

    describe("#addOutput", function() {
      it("add to system outputs", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { outputs: [] };
        scope.n.out = "some";
        scope.addOutput();
        expect(scope.system.outputs.length).toEqual(1);
        expect(scope.n.out).toEqual(null);
      });
    });

    describe("#dropOutput", function() {
      it("remove from system outputs", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { outputs: ["some", "output"] };
        scope.systemForm = { $setDirty: jasmine.createSpy() };
        scope.dropOutput(1);
        expect(scope.system.outputs).toEqual(["some"]);
        expect(scope.systemForm.$setDirty).toHaveBeenCalled();
      });
    });

    describe("#addSetpoint", function() {
      it("add to system setpoints", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { setpoints: { "some": "setpoint" } };
        scope.n.set = "other";
        scope.n.setValue = "setpoint";
        scope.addSetpoint();
        expect(scope.system.setpoints).toEqual({ "some": "setpoint", "other":"setpoint" });
        expect(scope.n.set).toEqual(null);
      });
    });

    describe("#dropSetpoint", function() {
      it("remove from system outputs", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { setpoints: { "some": "setpoint", "other":"setpoint" } };
        scope.systemForm = { $setDirty: jasmine.createSpy() };
        scope.dropSetpoint("some");
        expect(scope.system.setpoints).toEqual({ "other":"setpoint" });
        expect(scope.systemForm.$setDirty).toHaveBeenCalled();
      });
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.systemForm = {
          $setPristine: function() {},
        };
        spyOn(scope.systemForm, '$setPristine');

        httpBackend.expectPOST('/sites/2/systems', {site:2,outputs:[],setpoints:{},name:"hello",device:3}).
          respond({_id: 33, name: "hello", site: 2, device: 3,outputs:[],setpoints:{}});
      });

      it("should save system", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system.name = "hello";
        scope.system.device = 3;
        scope.save();
      });

      it("should clear form", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system.name = "hello";
        scope.system.device = 3;
        scope.save();
        httpBackend.flush();
        expect(scope.systemForm.$setPristine).toHaveBeenCalled();
      });

      it("should change location path", function() {
        controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system.name = "hello";
        scope.system.device = 3;
        scope.save();
        httpBackend.flush();
        expect(location.path()).toEqual('/sites/2/systems/33');
      });
    });

    describe("#updateDevice", function() {
      describe("when device not found", function() {
        it ("should do nothing", function() {
          httpBackend.expectGET('/devices?name=a').respond([{count: 0}]);
          controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
          scope.n.deviceName = "a";
          scope.updateDevice();
          httpBackend.flush();
          expect(scope.system.device).toEqual(null);
          expect(scope.device).toEqual({});
        });
      });
      describe("when device found", function() {
        beforeEach(function() {
          httpBackend.expectGET('/devices?name=b').respond([{_id: 2, name: "device"}, {count: 1}]);
          scope.$on = jasmine.createSpy();
        });

        it("should assign device", function() {
          controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
          scope.n.deviceName = "b";
          scope.updateDevice();
          httpBackend.flush();
          expect(scope.system.device).toEqual(2);
          expect(JSON.stringify(scope.device)).toEqual(JSON.stringify({_id: 2, name: "device"}));
        });
        /*
        describe("load device state", function() {
          beforeEach(function() {
            EventSource = function(url) {
              this.url = url;
              this.addEventListener = jasmine.createSpy();
              this.close = jasmine.createSpy();
            };
          });

          it("should define state", function() {
            controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
            scope.n.deviceName = "b";
            scope.updateDevice();
            httpBackend.flush();
            expect(scope.state).toBeDefined();
            expect(scope.state.outputs).toBeDefined();
          });

          it("should connect to event source", function() {
            controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
            scope.n.deviceName = "b";
            scope.updateDevice();
            httpBackend.flush();
            expect(scope.stateStream).toBeDefined();
            expect(scope.stateStream.url).toEqual("/devices/2/states?stream=1&interval=10");
          });

          it("should close old stream", function() {
            var oldStream = scope.stateStream = new EventSource("aaaa");
            scope.stateStream.close = jasmine.createSpy();
            controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
            scope.n.deviceName = "b";
            scope.updateDevice();
            httpBackend.flush();
            expect(scope.stateStream).toBeDefined();
            expect(scope.stateStream.url).toEqual("/devices/2/states?stream=1&interval=10");
            expect(oldStream.close).toHaveBeenCalled();
          });

          it("should add event listener", function() {
            controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
            scope.n.deviceName = "b";
            scope.updateDevice();
            httpBackend.flush();
            expect(scope.stateStream.addEventListener).toHaveBeenCalledWith("message", jasmine.any(Function), false);
          });

          it("should update state when message received", function() {
            scope.$apply = jasmine.createSpy();
            controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
            scope.n.deviceName = "b";
            scope.updateDevice();
            httpBackend.flush();
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
            controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
            scope.n.deviceName = "b";
            scope.updateDevice();
            httpBackend.flush();
            scope.$on.calls[0].args[1]();
            expect(scope.stateStream.close).toHaveBeenCalled();
            expect(onSpy).toHaveBeenCalled();
          });
        });*/
      });
    });
  });

  describe("SystemCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: jasmine.createSpy(),
        setNewURL: jasmine.createSpy(),
      };
      routeParams = { siteId: 2, systemId: 1 };
      httpBackend.expectGET('/sites/2/systems/1').respond({
        _id: 1,
        name: "hello",
        site: 2,
        device: 3,
        outputs: [{a1: 10}],
        setpoints: {a1: 5}
      });
      httpBackend.expectGET('/sites/2').respond({_id: 2, name: "site"});
      //httpBackend.expectGET('/devices/3').respond({_id: 3, name: "device"});
    }));

    it("should call page with params", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should define system", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.system).toBeDefined();
    });

    it("should define site", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.site).toBeDefined();
    });

    it("should define state", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.state).toEqual({outputs:{}});
    });

    it("should define device", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.device).toEqual({});
    });

    it("should define n", function() {
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.n).toEqual({});
    });

    describe("#addOutput", function() {
      it("add to system outputs", function() {
        controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { outputs: [] };
        scope.n.out = "some";
        scope.addOutput();
        expect(scope.system.outputs.length).toEqual(1);
        expect(scope.n.out).toEqual(null);
      });
    });

    describe("#dropOutput", function() {
      it("remove from system outputs", function() {
        controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { outputs: ["some", "output"] };
        scope.systemForm = { $setDirty: jasmine.createSpy() };
        scope.dropOutput(1);
        expect(scope.system.outputs).toEqual(["some"]);
        expect(scope.systemForm.$setDirty).toHaveBeenCalled();
      });
    });

    describe("#addSetpoint", function() {
      it("add to system setpoints", function() {
        controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { setpoints: { "some": "setpoint" } };
        scope.n.set = "other";
        scope.n.setValue = "setpoint";
        scope.addSetpoint();
        expect(scope.system.setpoints).toEqual({ "some": "setpoint", "other":"setpoint" });
        expect(scope.n.set).toEqual(null);
      });
    });

    describe("#dropSetpoint", function() {
      it("remove from system outputs", function() {
        controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
        scope.system = { setpoints: { "some": "setpoint", "other":"setpoint" } };
        scope.systemForm = { $setDirty: jasmine.createSpy() };
        scope.dropSetpoint("some");
        expect(scope.system.setpoints).toEqual({ "other":"setpoint" });
        expect(scope.systemForm.$setDirty).toHaveBeenCalled();
      });
    });

    describe("on system loaded", function() {
      beforeEach(function() {
        httpBackend.expectGET('/devices/3').respond({_id: 2, name: "device"});
        scope.$on = jasmine.createSpy();
      });
/*
      describe("load device state", function() {
        beforeEach(function() {
          EventSource = function(url) {
            this.url = url;
            this.addEventListener = jasmine.createSpy();
            this.close = jasmine.createSpy();
          };
        });

        it("should define state", function() {
          controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
          httpBackend.flush();
          expect(scope.state).toBeDefined();
          expect(scope.state.outputs).toBeDefined();
        });

        it("should connect to event source", function() {
          controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
          httpBackend.flush();
          expect(scope.stateStream).toBeDefined();
          expect(scope.stateStream.url).toEqual("/devices/3/states?stream=1&interval=10");
        });

        it("should close old stream", function() {
          var oldStream = scope.stateStream = new EventSource("aaaa");
          scope.stateStream.close = jasmine.createSpy();
          controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
          httpBackend.flush();
          expect(scope.stateStream).toBeDefined();
          expect(scope.stateStream.url).toEqual("/devices/3/states?stream=1&interval=10");
          expect(oldStream.close).toHaveBeenCalled();
        });

        it("should add event listener", function() {
          controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
          httpBackend.flush();
          expect(scope.stateStream.addEventListener).toHaveBeenCalledWith("message", jasmine.any(Function), false);
        });

        it("should update state when message received", function() {
          scope.$apply = jasmine.createSpy();
          controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
          httpBackend.flush();
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
          controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
          httpBackend.flush();
          scope.$on.calls[0].args[1]();
          expect(scope.stateStream.close).toHaveBeenCalled();
          expect(onSpy).toHaveBeenCalled();
        });
      });*/
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.systemForm = {};
        scope.systemForm.$setPristine = jasmine.createSpy();
        scope.$on = jasmine.createSpy();
        httpBackend.expectGET('/devices/3').respond({_id: 2, name: "device"});
        controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/sites/2/systems/1', {
          _id: 1,
          name: "hello",
          site: 2,
          device: 3,
          outputs: [{"a1":10}],
          setpoints: {"a1":5}
        }).respond({_id: 1, name: "hello"});
      });

      it("should save system", function() {
        scope.save();
      });

      it("should clear form", function() {
        scope.save();
        httpBackend.flush();
        expect(scope.systemForm.$setPristine).toHaveBeenCalled();
      });
    });
  });
});


