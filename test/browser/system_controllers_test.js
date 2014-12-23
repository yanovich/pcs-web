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
    var scope, routeParams;

    beforeEach(function() {
      routeParams = { siteId: 2 };
      scope = {
        $on: sinon.spy(),
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
      httpBackend.expectGET('/sites/2').respond({_id: 2, name: "site"});
      controller('NewSystemCtrl', { $scope: scope, $routeParams: routeParams });
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

    describe("#updateDevice", function() {
      describe("when device not found", function() {
        it ("should clear device", function() {
          scope.n.deviceName = "a";
          scope.device = { _id: 2 };
          scope.system.device = 2;
          httpBackend.expectGET('/devices?name=a').respond([{count: 0}]);
          scope.updateDevice();
          httpBackend.flush();
          expect(scope.system.device).to.equal(null);
          expect(scope.device).to.eql({});
        });
      });

      describe("when device found", function() {
        it("should assign device", function() {
          scope.n.deviceName = "b";
          httpBackend.expectGET('/devices?name=b').respond([{_id: 2, name: "device"}, {count: 1}]);
          scope.updateDevice();
          httpBackend.flush();
          expect(scope.system.device).to.equal(2);
          expect(JSON.stringify(scope.device)).to.eql(JSON.stringify({_id: 2, name: "device"}));
        });
      });
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
    var scope, routeParams;

    beforeEach(function() {
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
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
      controller('SystemCtrl', { $scope: scope, $routeParams: routeParams });
    });

    it("should clear pager", function() {
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should clear setNewURL", function() {
      expect(scope.setNewURL).to.have.been.calledWith(null);
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
