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

    describe("#setNewURL", function() {
      it("should update newURL", function() {
        expect(scope.newURL).to.be.undefined;
        scope.setNewURL("HELLO");
        expect(scope.newURL).to.equal("HELLO");
      });
    });

    describe("#page", function() {
      it("should update pager count", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.count).to.equal(26);
      });

      it("should update count per page", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.page).to.equal(1);
      });

      it("should update pager first", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.first).to.equal(1);
        scope.page(2, 23, 26);
        expect(scope.pager.first).to.equal(24);
      });

      it("should update pager last", function() {
        scope.page(1, 23, 26);
        expect(scope.pager.last).to.equal(23);
        scope.page(2, 23, 26);
        expect(scope.pager.last).to.equal(26);
      });

      describe("update show attribute", function() {
        it("should show if count is positive", function() {
          scope.page(1, 23, 26);
          expect(scope.pager.show).to.be.true;
        });

        it("should show if count is zero", function() {
          scope.page(1, 23, 0);
          expect(scope.pager.show).to.not.be.true;
        });
      });

      describe("update prev attribute", function() {
        it("should set prev if page is more then 1", function() {
          location.path("/hello");
          scope.page(2, 23, 26);
          expect(scope.pager.prev).to.equal('#/hello?page=1');
        });

        it("should clear prev is page is 1", function() {
          scope.page(1, 23, 26);
          expect(scope.pager.prev).to.equal('');
        });
      });
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
