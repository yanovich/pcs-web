'use strict';

/* Controllers */

angular.module('pcs.controllers', [])
  .controller('NavCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === '#' + $location.path();
    }
  }])
  .controller('PageCtrl', ['$scope', function($scope) {
    $scope.pager = {
      first: 0,
      last: 0,
      count: 0,
      page: 1,
      show: false
    }
  }])
  .controller('SitesCtrl', ['$scope', function($scope) {
    $scope.pager.first = 1;
    $scope.pager.last = 2;
    $scope.pager.count = 2;
    $scope.pager.show = true;
  }])
  .controller('UsersCtrl', ['$scope', '$location', 'User',
      function($scope, $location, User) {
        var page = Number($location.search().page) || 1;
        $scope.users = User.query({pageNum: page}, function () {
          var len = $scope.users.length - 1;
          var count = $scope.users.splice(len)[0].count;
          $scope.pager.count = count;
          if (count) {
            $scope.pager.show = true;
          } else {
            $scope.pager.show = false;
          }
          $scope.pager.page = page;
          $scope.pager.first = (page - 1) * 25 + 1;
          $scope.pager.last = page * 25;
          if (page > 1) {
            $scope.pager.prev = '#/users?page=' + (page - 1);
          } else {
            $scope.pager.prev = '';
          }
          if ($scope.pager.last >= $scope.pager.count) {
            $scope.pager.last = $scope.pager.count;
            $scope.pager.next = '';
          } else {
            $scope.pager.next = '#/users?page=' + (page + 1);
          }
        });
  }]);
