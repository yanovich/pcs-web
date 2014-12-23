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

  var controller;

  beforeEach(inject(function($controller) {
    controller = $controller;
  }));

  describe("NewSystemCtrl", function() {
    var scope, routeParams;

    beforeEach(function() {
      routeParams = { siteId: 2 };
      scope = {
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
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
