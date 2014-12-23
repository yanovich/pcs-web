/* test/browser/site_controllers_test.js -- test Site Angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("Site Controllers", function() {
  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  var controller;

  beforeEach(inject(function($controller) {
    controller = $controller;
  }));

  var httpBackend;

  beforeEach(inject(function($httpBackend) {
    httpBackend = $httpBackend;
  }));

  afterEach(function(){
    httpBackend.verifyNoOutstandingExpectation();
  });

  describe("NewSiteCtrl", function() {
    var scope;

    beforeEach(function() {
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    });

    it("should clear pager", function() {
      controller('NewSiteCtrl', { $scope: scope });
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should clear setNewURL", function() {
      controller('NewSiteCtrl', { $scope: scope });
      expect(scope.setNewURL).to.have.been.calledWith(null);
    });

    it("should create site in scope", function() {
      controller('NewSiteCtrl', { $scope: scope });
      expect(scope.site).to.exist();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.siteForm = {
          $setPristine: sinon.spy(),
        };

        httpBackend.expectPOST('/sites', { name: "hello" }).respond({_id: 2, name: "hello"});
        controller('NewSiteCtrl', { $scope: scope });
        scope.site.name = "hello";
      });

      it("should save site", function() {
        scope.save();
      });

      it("should set the form pristine", function() {
        scope.save();
        httpBackend.flush();
        expect(scope.siteForm.$setPristine).to.have.been.called;
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
