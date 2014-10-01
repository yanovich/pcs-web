'use strict'
/* test/app/unit/controllers/site.js -- test Site Angular controller
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("Site Controllers", function() {
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

  describe("NewSiteCtrl", function() {
    var scope, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: jasmine.createSpy(),
        setNewURL: jasmine.createSpy(),
      };
    }));

    it("should call page with params", function() {
      controller('NewSiteCtrl', { $scope: scope });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('NewSiteCtrl', { $scope: scope });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should create site", function() {
      controller('NewSiteCtrl', { $scope: scope });
      expect(scope.site).toBeDefined();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.siteForm = {
          $setPristine: jasmine.createSpy(),
        };

        httpBackend.expectPOST('/sites', { name: "hello" }).respond({_id: 2, name: "hello"});
      });

      it("should save site", function() {
        controller('NewSiteCtrl', { $scope: scope });
        scope.site.name = "hello";
        scope.save();
      });

      it("should clear form", function() {
        controller('NewSiteCtrl', { $scope: scope });
        scope.site.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(scope.siteForm.$setPristine).toHaveBeenCalled();
      });

      it("should change location path", function() {
        controller('NewSiteCtrl', { $scope: scope });
        scope.site.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(location.path()).toEqual('/sites/2');
      });
    });
  });

  describe("SiteCtrl", function() {
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
      routeParams = { siteId: 2 };
      httpBackend.expectGET('/sites/2').respond({_id: 2, name: "hello"});
    }));

    it("should call setNewURL with params", function() {
      httpBackend.expectGET('/sites/2/systems?page=1').respond([{_id: 2}, {count: 10}]);
      controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).toHaveBeenCalledWith('#/sites/2/systems/new');
    });

    it("should create site", function() {
      httpBackend.expectGET('/sites/2/systems?page=1').respond([{_id: 2}, {count: 10}]);
      controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.site).toBeDefined();
    });

    describe("define systems", function() {
      it("should create systems", function() {
        httpBackend.expectGET('/sites/2/systems?page=1').respond([{_id: 2}, {count: 10}]);
        controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
        expect(scope.systems).toBeDefined();
      });

      it("should call page with params", function() {
        httpBackend.expectGET('/sites/2/systems?page=1').respond([{_id: 2}, {count: 10}]);
        controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        expect(scope.page).toHaveBeenCalledWith(1, 25, 10);
      });

      it("should use page from uri query", function() {
        routeParams.page = 2;
        httpBackend.expectGET('/sites/2/systems?page=2').respond([{_id: 2}, {count: 10}]);
        controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
      });
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.siteForm = {
          $setPristine: function() {},
        };
        spyOn(scope.siteForm, '$setPristine');
      });

      it("should save site", function() {
        httpBackend.expectGET('/sites/2/systems?page=1').respond([{_id: 2}, {count: 10}]);
        controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/sites/2', { _id: 2, name: "world" }).respond({_id: 2, name: "hello"});
        scope.site.name = "world";
        scope.save();
      });

      it("should clear form", function() {
        httpBackend.expectGET('/sites/2/systems?page=1').respond([{_id: 2}, {count: 10}]);
        controller('SiteCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/sites/2', { _id: 2, name: "world" }).respond({_id: 2, name: "hello"});
        scope.site.name = "world";
        scope.save();
        httpBackend.flush();
        expect(scope.siteForm.$setPristine).toHaveBeenCalled();
      });
    });
  });

  describe("SitesCtrl", function() {
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
      httpBackend.expectGET('/sites?page=1').respond([]);
      controller('SitesCtrl', { $scope: scope });
      expect(scope.setNewURL).toHaveBeenCalledWith('#/sites/new');
    });

    it("should call page after load sites", function() {
      httpBackend.expectGET('/sites?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('SitesCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.page).toHaveBeenCalledWith(1, 25, 2);
    });

    it("should fill sites", function() {
      httpBackend.expectGET('/sites?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('SitesCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.sites.length).toEqual(1);
      expect(scope.sites[0]._id).toEqual(1);
    });

    it("should use page from query params", function() {
      location.search({page: 2});
      httpBackend.expectGET('/sites?page=2').respond([{_id: 1}, { count: 2 }]);
      controller('SitesCtrl', { $scope: scope });
    });
  });
});





