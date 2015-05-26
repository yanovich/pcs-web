'use strict';


// Declare app level module which depends on filters, and services
angular.module('pcs', [
  'ngRoute',
  'pcs.filters',
  'pcs.services',
  'pcs.directives',
  'pcs.controllers'
]).
config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.when('/devices/new', {templateUrl: 'partials/device.html', controller: 'NewDeviceCtrl'});
  $routeProvider.when('/devices/:deviceId', {templateUrl: 'partials/device.html', controller: 'DeviceCtrl'});
  $routeProvider.when('/devices', {templateUrl: 'partials/devices.html', controller: 'DevicesCtrl'});
  $routeProvider.when('/sites/:siteId/systems/new', {templateUrl: 'partials/system.html', controller: 'NewSystemCtrl'});
  $routeProvider.when('/sites/:siteId/systems/:systemId', {templateUrl: 'partials/system.html', controller: 'SystemCtrl'});
  $routeProvider.when('/sites/new', {templateUrl: 'partials/site.html', controller: 'NewSiteCtrl'});
  $routeProvider.when('/sites/:siteId', {templateUrl: 'partials/site.html', controller: 'SiteCtrl'});
  $routeProvider.when('/sites', {templateUrl: 'partials/sites.html', controller: 'SitesCtrl'});
  $routeProvider.when('/users/new', {templateUrl: 'partials/user.html', controller: 'NewUserCtrl'});
  $routeProvider.when('/users/:userId', {templateUrl: 'partials/user.html', controller: 'UserCtrl'});
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'UsersCtrl'});
  $routeProvider.otherwise({redirectTo: '/sites'});

  $httpProvider.interceptors.push(['$rootScope', '$q', '$window', function($rootScope, $q, $window) {
    return {
      responseError: function(rejection) {
        switch (rejection.status) {
          case 401: {
            var returnTo = $window.location.pathname + $window.location.hash + $window.location.search;
            $window.location.href = '/signin?returnTo=' + window.escape(returnTo);
          }
          break;
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }]);
}]);
