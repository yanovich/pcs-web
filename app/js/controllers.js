'use strict';

/* Controllers */

angular.module('pcs.controllers', [])
  .controller('NavCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === '#' + $location.path();
    }
  }])
  .controller('PageCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.pager = {
      first: 0,
      last: 0,
      count: 0,
      page: 1,
      show: false
    }
    $scope.operator = {}
    $scope.setNewURL = function (url) {
      $scope.newURL = url;
    }
    $scope.page = function (page, perPage, count) {
      $scope.pager.count = count;
      if (count) {
        $scope.pager.show = true;
      } else {
        $scope.pager.show = false;
      }
      $scope.pager.page = page;
      $scope.pager.first = (page - 1) * perPage + 1;
      $scope.pager.last = page * perPage;
      if (page > 1) {
        $scope.pager.prev = '#' + $location.path() + '?page=' + (page - 1);
      } else {
        $scope.pager.prev = '';
      }
      if ($scope.pager.last >= $scope.pager.count) {
        $scope.pager.last = $scope.pager.count;
        $scope.pager.next = '';
      } else {
        $scope.pager.next = '#' + $location.path() + '?page=' + (page + 1);
      }
    }
  }])
  .controller('SitesCtrl', ['$scope', function($scope) {
    $scope.page(1, 25, 2);
    $scope.setNewURL(null);
  }])
  .controller('NewUserCtrl', ['$scope', '$location', 'User',
      function($scope, $location, User) {
        $scope.page(1, 1, 0);
        $scope.setNewURL(null);
        $scope.user = new User();
        $scope.save = function () {
          console.log('Saving ' + $scope.user.name);
          $scope.user.$save({}, function () {
            $scope.userForm.$setPristine();
            console.log($scope.user);
            $location.path('/users/' + $scope.user._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('UserCtrl', ['$scope', '$routeParams', 'User',
      function($scope, $routeParams, User) {
        $scope.page(1, 1, 0);
        if ($scope.operator.admin) {
          $scope.setNewURL('#/users/new');
        }
        $scope.user = User.get({ userId: $routeParams.userId }, function () {
          console.log($scope.user);
        });
        $scope.save = function () {
          console.log('Saving ' + $scope.user._id);
          $scope.user.$save({}, function () {
            $scope.userForm.$setPristine();
            console.log($scope.user);
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('UsersCtrl', ['$scope', '$location', 'User',
      function($scope, $location, User) {
        var page = Number($location.search().page) || 1;
        if ($scope.operator.admin) {
          $scope.setNewURL('#/users/new');
        }
        $scope.users = User.query({pageNum: page}, function () {
          var len = $scope.users.length - 1;
          var count = $scope.users.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }]);
