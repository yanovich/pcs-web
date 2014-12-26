/* test/browser/system_controllers_test.js -- test System angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("System Controllers", function() {
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

  describe("NewSystemCtrl", function() {
    var scope, routeParams, systemHelper;

    beforeEach(function() {
      routeParams = { siteId: 2 };
      scope = {
        $on: sinon.spy(),
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
      systemHelper = {
        setDeviceUpdater: sinon.spy()
      };
      httpBackend.expectGET('/sites/2').respond({_id: 2, name: "site"});
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams, SystemHelper: systemHelper });
    });

    it("should clear pager", function() {
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should clear setNewURL", function() {
      expect(scope.setNewURL).to.have.been.calledWith(null);
    });

    it("should create system in scope", function() {
      expect(scope.system).to.exist();
      expect(scope.system.site).to.equal(2);
    });

    it("should init binding buffer", function() {
      expect(scope.n).to.eql({});
    });

    it("should create updateDevice method", function() {
      expect(systemHelper.setDeviceUpdater).to.have.been.calledWith(scope);
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.systemForm = {
          $setPristine: sinon.spy(),
        };

        httpBackend.expectPOST('/sites/2/systems', {
          site: 2, name: "hello", device: 3
        }).respond({
          _id: 33, name: "hello", site: 2, device: 3, outputs: [], setpoints: {}
        });
        scope.system.name = "hello";
        scope.system.device = 3;
      });

      it("should save system", function() {
        scope.save();
      });

      it("should set the form pristine", function() {
        scope.save();
        httpBackend.flush();
        expect(scope.systemForm.$setPristine).to.have.been.called;
      });

      it("should change location path", function() {
        scope.save();
        httpBackend.flush();
        expect(location.path()).to.equal('/sites/2/systems/33');
      });
    });
  });

  describe("SystemCtrl", function() {
    var scope, routeParams, deviceHelper, systemHelper;

    beforeEach(function() {
      scope = {
        $on: sinon.spy(),
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
      routeParams = { siteId: 2, systemId: 1 };
      httpBackend.expectGET('/sites/2/systems/1').respond({
        _id: 1,
        name: "hello",
        site: 2,
        device: 3,
        outputs: ["a1"],
        setpoints: {a1: 5}
      });
      httpBackend.expectGET('/sites/2').respond({_id: 2, name: "site"});
      httpBackend.expectGET('/devices/3').respond({_id: 3, name: "device"});
      deviceHelper = {
        loadDeviceState: sinon.spy()
      };
      systemHelper = {
        setDeviceUpdater: sinon.spy()
      };
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams,
                 DeviceHelper: deviceHelper, SystemHelper: systemHelper });
      httpBackend.flush();
    });

    it("should clear pager", function() {
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should clear setNewURL", function() {
      expect(scope.setNewURL).to.have.been.calledWith(null);
    });

    it("should load system", function() {
      expect(scope.system).to.exist();
      expect(scope.system._id).to.equal(1);
      expect(scope.system.site).to.equal(2);
      expect(scope.system.device).to.equal(3);
      expect(scope.system.name).to.equal("hello");
    });

    it("should load site", function() {
      expect(scope.site).to.exist();
      expect(scope.site._id).to.equal(2);
      expect(scope.site.name).to.equal("site");
    });

    it("should init binding buffer", function() {
      expect(scope.n.deviceName).to.exist();
    });

    it("should load device state", function() {
      expect(deviceHelper.loadDeviceState).to.have.been.calledWith(scope, 3);
    });

    it("should create device update function", function() {
      expect(systemHelper.setDeviceUpdater).to.have.been.calledWith(scope);
    });

    describe("#addOutput", function() {
      it("should add to system outputs", function() {
        scope.system = { outputs: [] };
        scope.n.out = "some";
        scope.addOutput();
        expect(scope.system.outputs.length).to.equal(1);
        expect(scope.system.outputs[0]).to.equal("some");
        expect(scope.n.out).to.eql(null);
      });
    });

    describe("#dropOutput", function() {
      it("should remove from system outputs", function() {
        scope.system = { outputs: ["some", "output"] };
        scope.systemForm = { $setDirty: sinon.spy() };
        scope.dropOutput(1);
        expect(scope.system.outputs).to.eql(["some"]);
        expect(scope.systemForm.$setDirty).to.have.been.called;
      });
    });

    describe("#addSetpoint", function() {
      it("add to system setpoints", function() {
        scope.system = { setpoints: { "some": "setpoint" } };
        scope.n.set = "other";
        scope.n.setValue = "setpoint";
        scope.addSetpoint();
        expect(scope.system.setpoints).to.eql({ "some": "setpoint", "other":"setpoint" });
        expect(scope.n.set).to.equal(null);
      });
    });

    describe("#dropSetpoint", function() {
      it("remove from system outputs", function() {
        scope.system = { setpoints: { "some": "setpoint", "other":"setpoint" } };
        scope.systemForm = { $setDirty: sinon.spy() };
        scope.dropSetpoint("some");
        expect(scope.system.setpoints).to.eql({ "other":"setpoint" });
        expect(scope.systemForm.$setDirty).to.have.been.called;
      });
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.systemForm = {};
        scope.systemForm.$setPristine = sinon.spy();
        scope.$on = sinon.spy();
        httpBackend.expectPOST('/sites/2/systems/1', {
          _id: 1,
          name: "world",
          site: 2,
          device: 3,
          outputs: ["a1"],
          setpoints: {"a1":5}
        }).respond({_id: 1, name: "world"});
        scope.system.name = "world";
      });

      it("should save system", function() {
        scope.save();
      });

      it("should clear form", function() {
        scope.save();
        httpBackend.flush();
        expect(scope.systemForm.$setPristine).to.have.been.called;
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
