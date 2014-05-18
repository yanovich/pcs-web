'use strict';

/* Controllers */

angular.module('pcs.controllers', [])
  .controller('NavCtrl', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === '#' + $location.path();
    }
  }])
  .controller('SitesCtrl', ['$scope', function($scope) {

  }])
  .controller('UsersCtrl', ['$scope', function($scope) {

  }]);
