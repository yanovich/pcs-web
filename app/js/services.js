/* app/js/services.js -- angular services
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

'use strict';

angular.module('pcs.services', ['ngResource'])
  .factory('Device', ['$resource',
      function ($resource) {
        return $resource('/devices/:deviceId', { deviceId: '@_id' });
      }])
  .factory('Setpoints', ['$resource',
      function ($resource) {
        return $resource('/devices/:deviceId/setpoints');
      }])
  .factory('Site', ['$resource',
      function ($resource) {
        return $resource('/sites/:siteId', { siteId: '@_id' });
      }])
  .factory('State', ['$resource',
      function ($resource) {
        return $resource('/devices/:deviceId/states/:stateId',
          { deviceId: '@device', stateId: '@_id' });
      }])
  .factory('System', ['$resource',
      function ($resource) {
        return $resource('/sites/:siteId/systems/:systemId', { siteId: '@site', systemId: '@_id' });
      }])
  .factory('User', ['$resource',
      function ($resource) {
        return $resource('/users/:userId', { userId: '@_id' });
      }])
  .factory('ServerEvents', [
      function() {
        return {
          create: function(url) {
            return new EventSource(url);
          }
        };
      }])
  .factory('DeviceHelper', ['ServerEvents',
      function(ServerEvents) {
        var utils = {
          loadDeviceState: function($scope, deviceId) {
            if ($scope.stateStream) $scope.stateStream.close();
            $scope.stateStream = ServerEvents.create('/devices/' + deviceId
              + '/states?stream=1&interval=10');
            $scope.state = { outputs: {} };
            $scope.stateStream.addEventListener('message', function (e) {
              $scope.$apply(function () {
                $scope.state = angular.fromJson(e.data);
              });
            }, false);
            var off = $scope.$on('$locationChangeStart', function (e, next, current) {
              if ($scope.stateStream) $scope.stateStream.close();
              off();
            });
          }
        };
        return utils;
      }])
  .factory('SystemHelper', ['Device', 'DeviceHelper',
      function(Device, DeviceHelper) {
        return {
          setDeviceUpdater: function($scope) {
            $scope.updateDevice = function () {
              $scope.device = {};
              $scope.system.device = null;
              var devices = Device.query({ name: $scope.n.deviceName }, function () {
                if (devices.length !== 2) {
                  return;
                }
                $scope.device = devices[0];
                $scope.system.device = devices[0]._id;
                DeviceHelper.loadDeviceState($scope, $scope.system.device);
              });
            }
          }
        };
      }])
// vim:ts=2 sts=2 sw=2 et:
