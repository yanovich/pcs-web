/* test/browser/server_events_service_test.js -- test Server Events Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("ServerEvents Service", function() {

  beforeEach(module("pcs.services"));

  it("should return factory with create method", function() {
    inject(function(ServerEvents) {
      expect(ServerEvents.create).not.to.have.been.an('undefined');
    });
  });

  it("should create EventSource", function() {
    var oldES = window.EventSource;
    var newES = window.EventSource = sinon.spy();
    inject(function(ServerEvents) {
      var es = ServerEvents.create("someUrl");
      window.EventSource = oldES;

      expect(newES).to.have.been.calledWith('someUrl');
    });
  });
});
// vim:ts=2 sts=2 sw=2 et:
