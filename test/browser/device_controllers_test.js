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

  describe("NewDeviceCtrl", function() {
    var scope, controller;

    beforeEach(inject(function($controller) {
      controller = $controller;
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    }));

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
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
