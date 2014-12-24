/* test/browser/nav_controller_test.js -- test Nav Angular controller
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("Nav Controller", function() {
  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  describe("NavCtrl", function() {
    var scope, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {};
    }));

    it("should define isActive", function() {
      location.path("/aaa");
      controller('NavCtrl', { $scope: scope });
      expect(scope.isActive).to.exist();
      expect(scope.isActive("#/aaa")).to.be.true;
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
