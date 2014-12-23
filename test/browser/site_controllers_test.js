/* test/browser/site_controllers_test.js -- test Site Angular controllers
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("Site Controllers", function() {
  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  var controller;

  beforeEach(inject(function($controller) {
    controller = $controller;
  }));

  describe("NewSiteCtrl", function() {
    var scope;

    beforeEach(function() {
      scope = {
        page: sinon.spy(),
        setNewURL: sinon.spy(),
      };

      controller('NewSiteCtrl', { $scope: scope });
    });

    it("should clear pager", function() {
      expect(scope.page).to.have.been.calledWith(1, 1, 0);
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
