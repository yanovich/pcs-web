/* test/browser/device_controllers_test.js -- test Device angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict'

describe("Device Controllers", function() {
  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  describe("NewDeviceCtrl", function() {
    var scope, controller;

    beforeEach(inject(function($controller) {
      controller = $controller;
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };
    }));

    it("should clear pager", function() {
      controller('NewDeviceCtrl', { $scope: scope });
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
