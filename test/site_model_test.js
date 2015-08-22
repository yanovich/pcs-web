/* test/site_model_test.js -- test Site model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var Site = require('../models/site');

var siteAttrs = {
  name: "Site",
};

describe('Site', function () {
  var site;
  before(function (done) {
    site = new Site(siteAttrs);
    done();
  })

  it('should respond to name', function () {
    expect(site.name).not.to.be.an('undefined');
  });

  it('should be valid', function (done) {
    site.validate(function (err) {
      expect(err).to.be.an('undefined');
      done();
    });
  });

  describe('when name is not present', function () {
    it('should not be valid', function (done) {
      site.name = " ";
      site.validate(function(err) {
        expect(err).not.to.be.an('undefined');
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
        expect(err).not.to.be.an('undefined');
        done();
      });
    });
  });
});
