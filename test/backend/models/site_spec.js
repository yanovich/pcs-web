'use strict'
/* test/backend/models/site_spec.js -- test Site model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var Site = require('../../../models/site');

var siteAttrs = {
  name: "Site",
};

describe('Site', function() {
  var site;
  beforeEach(function(done) {
    site = new Site(siteAttrs);
    return done();
  });

  describe("#scheme", function() {
    it('should respond to name', function () {
      expect(site.name).toBeDefined();
    });
  });

  describe("#validate", function() {
    it('should be valid', function (done) {
      site.validate(function (err) {
        expect(err).toBeFalsy();
        done();
      });
    });

    describe('when name is not present', function () {
      it('should not be valid', function (done) {
        site.name = " ";
        site.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    });

    describe('when name is too long', function () {
      it('should not be valid', function (done) {
        site.name = "";
        for (var i = 0; i < 51; ++ i) {
          site.name += "i";
        }
        site.validate(function(err) {
          expect(err).toBeTruthy();
          done();
        });
      });
    });
  });
});

