'use strict'
/* test/models/_mailer_spec.js -- test mailer helper methods
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var helper = require('../spec_helper');
var Routes = require('../../../routes/_mailer');
var mailer = require('nodemailer');

describe('Mailer helper', function() {
  describe("#send", function() {
    it("should sen mail with options", function(done) {
      var transport = {};

      mailer.createTransport = jasmine.createSpy("mailer.createTransport").andReturn(transport);
      transport.sendMail = jasmine.createSpy("transport.sendMail");

      Routes.send({opt: 1}, function() {
        done();
      });

      expect(mailer.createTransport).toHaveBeenCalled();
      expect(transport.sendMail).toHaveBeenCalledWith({opt: 1}, jasmine.any(Function));
      transport.sendMail.argsForCall[0][1]();
    });
  });
});

