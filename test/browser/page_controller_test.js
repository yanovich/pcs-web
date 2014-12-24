/* test/app/unit/controllers/page.js -- test Page Angular controller
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("Page Controller", function() {
  var httpBackend;

  beforeEach(function() {
    angular.mock.module('pcs.services');
    angular.mock.module('pcs.controllers');
  });

  beforeEach(inject(function($httpBackend) {
    httpBackend = $httpBackend;
  }));

  afterEach(function(){
    httpBackend.verifyNoOutstandingExpectation();
  });

  describe("PageCtrl", function() {
    var scope, location, controller;

    beforeEach(inject(function($location, $controller) {
      location = $location;
      controller = $controller;
      scope = {};
      controller('PageCtrl', { $scope: scope });
    }));

    it("should define pager", function() {
      expect(scope.pager).to.exist();
      expect(scope.pager.first).to.equal(0);
      expect(scope.pager.last).to.equal(0);
      expect(scope.pager.count).to.equal(0);
      expect(scope.pager.page).to.equal(1);
      expect(scope.pager.show).to.not.be.true;
    });

    it("should define moment", function() {
      expect(scope.moment).to.exist();
    });

    it("should define operator", function() {
      expect(scope.operator).to.eql({});
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
