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

// vim:ts=2 sts=2 sw=2 et:
