/* app/js/services.js -- angular services
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

'use strict';

angular.module('pcs.services', ['ngResource'])
  .factory('Site', ['$resource',
      function ($resource) {
        return $resource('/sites/:siteId?page=:pageNum', { siteId: '@_id' });
      }])
  .factory('User', ['$resource',
      function ($resource) {
        return $resource('/users/:userId?page=:pageNum', { userId: '@_id' });
      }])

// vim:ts=2 sts=2 sw=2 et:
