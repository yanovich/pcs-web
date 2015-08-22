/* test/browser/user_controllers_test.js -- test User Angular controller
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

'use strict'

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
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    }));

    it("should call page with params", function() {
      controller('NewUserCtrl', { $scope: scope });
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('NewUserCtrl', { $scope: scope });
      expect(scope.setNewURL).to.have.been.calledWith(null);
    });

    it("should create user", function() {
      controller('NewUserCtrl', { $scope: scope });
      expect(scope.user).to.exist();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.userForm = {
          $setPristine: sinon.spy(),
        };

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
        expect(scope.userForm.$setPristine).to.have.been.called;
      });

      it("should change location path", function() {
        controller('NewUserCtrl', { $scope: scope });
        scope.user.name = "hello";
        scope.save();
        httpBackend.flush();
        expect(location.path()).to.equal('/users/2');
      });
    });
  });

  describe("UserCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
      routeParams = { userId: 2 };
      httpBackend.expectGET('/users/2').respond({_id: 2, name: "hello"});
    }));

    it("should call page with params", function() {
      controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });

    it("should call setNewURL with params", function() {
      controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.setNewURL).to.have.been.calledWith('#/users/new');
    });

    it("should create user", function() {
      controller('UserCtrl', { $scope: scope, $routeParams: routeParams });
      expect(scope.user).to.exist();
    });

    describe("#save", function() {
      beforeEach(function() {
        scope.userForm = {
          $setPristine: sinon.spy(),
        };
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
        expect(scope.userForm.$setPristine).to.have.been.called;
      });
    });
  });

  describe("UsersCtrl", function() {
    var scope, routeParams, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    }));

    it("should call setNewURL", function() {
      httpBackend.expectGET('/users?page=1').respond([]);
      controller('UsersCtrl', { $scope: scope });
      expect(scope.setNewURL).to.have.been.calledWith('#/users/new');
    });

    it("should call page after load users", function() {
      httpBackend.expectGET('/users?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('UsersCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.page).to.have.been.calledWith(1, 25, 2);
    });

    it("should fill users", function() {
      httpBackend.expectGET('/users?page=1').respond([{_id: 1}, { count: 2 }]);
      controller('UsersCtrl', { $scope: scope });
      httpBackend.flush();
      expect(scope.users.length).to.equal(1);
      expect(scope.users[0]._id).to.equal(1);
    });

    it("should use page from query params", function() {
      location.search({page: 2});
      httpBackend.expectGET('/users?page=2').respond([{_id: 1}, { count: 2 }]);
      controller('UsersCtrl', { $scope: scope });
    });
  });
});
