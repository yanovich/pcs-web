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
  .controller('NewDeviceCtrl', ['$scope', '$location', 'Device',
      function($scope, $location, Device) {
        $scope.page(1, 1, 0);
        $scope.setNewURL(null);
        $scope.device = new Device();
        $scope.save = function () {
          console.log('Saving ' + $scope.device.name);
          $scope.device.$save({}, function () {
            $scope.deviceForm.$setPristine();
            console.log($scope.device);
            $location.path('/devices/' + $scope.device._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('DeviceCtrl', ['$scope', '$routeParams', 'Device',
      function($scope, $routeParams, Device) {
        $scope.page(1, 1, 0);
        $scope.setNewURL('#/devices/new');
        console.log($routeParams);
        $scope.device = Device.get({ deviceId: $routeParams.deviceId }, function () {
          console.log($scope.device);
        });
        $scope.save = function () {
          console.log('Saving ' + $scope.device._id);
          $scope.device.$save({}, function () {
            $scope.deviceForm.$setPristine();
            console.log($scope.device);
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('DevicesCtrl', ['$scope', '$location', 'Device',
      function($scope, $location, Device) {
        var page = Number($location.search().page) || 1;
        $scope.setNewURL('#/devices/new');
        $scope.devices = Device.query({pageNum: page}, function () {
          var len = $scope.devices.length - 1;
          var count = $scope.devices.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }])
  .controller('NewSiteCtrl', ['$scope', '$location', 'Site',
      function($scope, $location, Site) {
        $scope.page(1, 1, 0);
        $scope.setNewURL(null);
        $scope.site = new Site();
        $scope.save = function () {
          console.log('Saving ' + $scope.site.name);
          $scope.site.$save({}, function () {
            $scope.siteForm.$setPristine();
            console.log($scope.site);
            $location.path('/sites/' + $scope.site._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('SiteCtrl', ['$scope', '$routeParams', 'Site',
      function($scope, $routeParams, Site) {
        $scope.page(1, 1, 0);
        $scope.setNewURL('#/sites/new');
        console.log($routeParams);
        $scope.site = Site.get({ siteId: $routeParams.siteId }, function () {
          console.log($scope.site);
        });
        $scope.save = function () {
          console.log('Saving ' + $scope.site._id);
          $scope.site.$save({}, function () {
            $scope.siteForm.$setPristine();
            console.log($scope.site);
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('SitesCtrl', ['$scope', '$location', 'Site',
      function($scope, $location, Site) {
        var page = Number($location.search().page) || 1;
        $scope.setNewURL('#/sites/new');
        $scope.sites = Site.query({pageNum: page}, function () {
          var len = $scope.sites.length - 1;
          var count = $scope.sites.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
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
        $scope.setNewURL('#/users/new');
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
        $scope.setNewURL('#/users/new');
        $scope.users = User.query({pageNum: page}, function () {
          var len = $scope.users.length - 1;
          var count = $scope.users.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }]);
