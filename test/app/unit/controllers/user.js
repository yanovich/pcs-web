'use strict'
/* test/app/unit/controllers/user_spec.js -- test User Angular controller
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

describe("User Controllers", function() {
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

  describe("NewUserCtrl", function() {
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
      controller('NewUserCtrl', { $scope: scope });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('NewUserCtrl', { $scope: scope });
      expect(scope.setNewURL).toHaveBeenCalledWith(null);
    });

    it("should create user", function() {
      controller('NewUserCtrl', { $scope: scope });
      expect(scope.user).toBeDefined();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.userForm = {
          $setPristine: function() {},
        };
        spyOn(scope.userForm, '$setPristine');

        httpBackend.expectPOST('/users', { name: "hello" }).respond({_id: 2, name: "hello"});
      });

      it("should save user", function() {
        controller('NewUserCtrl', { $scope: scope });
        scope.user.name = "hello";
        scope.save();
      });

      it("should clear form", function() {
        controller('NewUserCtrl', { $scope: scope });
        scope.user.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(scope.userForm.$setPristine).toHaveBeenCalled();
      });

      it("should change location path", function() {
        controller('NewUserCtrl', { $scope: scope });
        scope.user.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(location.path()).toEqual('/users/2');
      });
    });
  });

  describe("UserCtrl", function() {
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
      routeParams = { userId: 2 };
      httpBackend.expectGET('/users/2').respond({_id: 2, name: "hello"});
    }));

    it("should call page with params", function() {
      controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.page).toHaveBeenCalledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).toHaveBeenCalledWith('#/users/new');
    });

    it("should create user", function() {
      controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.user).toBeDefined();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.userForm = {
          $setPristine: function() {},
        };
        spyOn(scope.userForm, '$setPristine');
      });

      it("should save user", function() {
        controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/users/2', { _id: 2, name: "world" }).respond({_id: 2, name: "hello"});
        scope.user.name = "world";
        scope.save();
      });

      it("should clear form", function() {
        controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
        httpBackend.flush();
        httpBackend.expectPOST('/users/2', { _id: 2, name: "world" }).respond({_id: 2, name: "hello"});
        scope.user.name = "world";
        scope.save();
        httpBackend.flush();
        expect(scope.userForm.$setPristine).toHaveBeenCalled();
      });
    });
  });

  describe("UsersCtrl", function() {
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
      httpBackend.expectGET('/users?page=1').respond([]);
      controller('UsersCtrl', { $scope: scope });
      expect(scope.setNewURL).toHaveBeenCalledWith('#/users/new');
    });

    it("should call page after load users", function() {
      httpBackend.expectGET('/users?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('UsersCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.page).toHaveBeenCalledWith(1, 25, 2);
    });

    it("should fill users", function() {
      httpBackend.expectGET('/users?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('UsersCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.users.length).toEqual(1);
      expect(scope.users[0]._id).toEqual(1);
    });

    it("should use page from query params", function() {
      location.search({page: 2});
      httpBackend.expectGET('/users?page=2').respond([{_id: 1}, { count: 2 }]);
      controller('UsersCtrl', { $scope: scope });
    });
  });
});



