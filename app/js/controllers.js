/* app/js/controllers.js -- application controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

'use strict';

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
    $scope.moment = moment;
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
  .controller('DeviceCtrl', ['$scope', '$routeParams', 'Device', 'State',
      function($scope, $routeParams, Device, State) {
        $scope.page(1, 1, 0);
        $scope.setNewURL('#/devices/new');
        console.log($routeParams);
        $scope.device = Device.get({ deviceId: $routeParams.deviceId }, function () {
          console.log($scope.device);
        });
        $scope.state = {};
        var states = State.query({deviceId: $routeParams.deviceId,
          limit: 1}, function () {
            $scope.state = states[0];
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
        $scope.devices = Device.query({page: page}, function () {
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
  .controller('SiteCtrl', ['$scope', '$routeParams', 'Site', 'System',
      function($scope, $routeParams, Site, System) {
        var page = Number($routeParams.page) || 1;
        $scope.setNewURL('#/sites/' + $routeParams.siteId + '/systems/new');
        console.log($routeParams);
        $scope.site = Site.get({ siteId: $routeParams.siteId }, function () {
          console.log($scope.site);
        });
        $scope.systems = System.query({siteId: $routeParams.siteId,
		page: page}, function () {
          var len = $scope.systems.length - 1;
          var count = $scope.systems.splice(len)[0].count;
          $scope.page(page, 25, count);
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
        $scope.sites = Site.query({page: page}, function () {
          var len = $scope.sites.length - 1;
          var count = $scope.sites.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }])
  .controller('NewSystemCtrl', ['$scope', '$routeParams', '$location',
		  'Site', 'System',
      function($scope, $routeParams, $location, Site, System) {
        $scope.page(1, 1, 0);
        $scope.setNewURL(null);
        $scope.system = new System();
        $scope.system.site = $routeParams.siteId;
        $scope.site = Site.get({ siteId: $routeParams.siteId });
        $scope.save = function () {
          console.log('Saving ' + $scope.system.name);
          $scope.system.$save({}, function () {
            $scope.systemForm.$setPristine();
            console.log($scope.system);
            $location.path('/sites/' + $scope.site._id + '/systems/'
		    + $scope.system._id).replace();
          }, function (res) {
            console.log(res);
          });
        }
  }])
  .controller('SystemCtrl', ['$scope', '$routeParams', 'Site', 'System',
      'Device', 'State',
      function($scope, $routeParams, Site, System, Device, State) {
        $scope.device = '';
        $scope.n = {};
        $scope.page(1, 1, 0);
        $scope.setNewURL(null);
        $scope.system = System.get({ siteId: $routeParams.siteId,
          systemId: $routeParams.systemId }, function () {
            var device = Device.get({ deviceId: $scope.system.device }, function () {
              console.log(device);
              $scope.device = device.name;
            });
            if (!$scope.system.outputs)
              $scope.system.outputs = [];
            $scope.state = {};
            var states = State.query({deviceId: $scope.system.device,
              limit: 1}, function () {
                $scope.state = states[0];
                console.log(states[0]);
              });
          });
        $scope.site = Site.get({ siteId: $routeParams.siteId });
        $scope.addOutput = function () {
          $scope.system.outputs.push($scope.n.out);
          $scope.n.out = null;
        }
        $scope.dropOutput = function (i) {
          $scope.system.outputs.splice(i);
        }
        $scope.save = function () {
          console.log('Saving ' + $scope.system.name);
          $scope.system.$save({}, function () {
            $scope.systemForm.$setPristine();
            console.log($scope.system);
          }, function (res) {
            console.log(res);
          });
        }
        $scope.updateDevice = function () {
          var devices = Device.query({ name: $scope.device }, function () {
            if (devices.length !== 2) {
              $scope.system.device = null;
              return;
            }
            $scope.system.device = devices[0]._id;
          });
        }
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
        $scope.users = User.query({page: page}, function () {
          var len = $scope.users.length - 1;
          var count = $scope.users.splice(len)[0].count;
          $scope.page(page, 25, count);
        });
  }]);

// vim:ts=2 sts=2 sw=2 et:
