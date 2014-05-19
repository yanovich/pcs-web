'use strict';


// Declare app level module which depends on filters, and services
angular.module('pcs', [
  'ngRoute',
  'pcs.filters',
  'pcs.services',
  'pcs.directives',
  'pcs.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/sites/new', {templateUrl: 'partials/site.html', controller: 'NewSiteCtrl'});
  $routeProvider.when('/sites/:siteId', {templateUrl: 'partials/site.html', controller: 'SiteCtrl'});
  $routeProvider.when('/sites', {templateUrl: 'partials/sites.html', controller: 'SitesCtrl'});
  $routeProvider.when('/users/new', {templateUrl: 'partials/user.html', controller: 'NewUserCtrl'});
  $routeProvider.when('/users/:userId', {templateUrl: 'partials/user.html', controller: 'UserCtrl'});
  $routeProvider.when('/users', {templateUrl: 'partials/users.html', controller: 'UsersCtrl'});
  $routeProvider.otherwise({redirectTo: '/sites'});
}]);
