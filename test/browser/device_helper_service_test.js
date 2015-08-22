/* test/browser/device_helper_service_test.js -- test Device Helper Angular service
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
'use strict';

describe("DeviceHelper Service", function() {
 var service;

  beforeEach(function() {
    service = {};
    service.events = {};
    angular.mock.module('pcs.services', function($provide) {
      $provide.value('ServerEvents', service.events);
    });
  });

  describe("#loadDeviceState", function() {
    var source, scope, $service;
    beforeEach(inject(function(DeviceHelper) {
      scope = {
        $on: sinon.spy()
      };
      source = function(url) {
        this.url = url;
        this.addEventListener = sinon.spy();
        this.close = sinon.spy();
      };
      service.events.create = function(url) {
        return new source(url);
      };
      $service = DeviceHelper;
    }));

    it("should define state", function() {
      $service.loadDeviceState(scope, 2);
      expect(scope.state).to.exist();
      expect(scope.state.outputs).to.exist();
    });

    it("should connect to event source", function() {
      $service.loadDeviceState(scope, 2);
      expect(scope.stateStream).to.exist();
      expect(scope.stateStream.url).to.equal("/devices/2/states?stream=1&interval=10");
    });

    it("should close old stream", function() {
      var oldStream = scope.stateStream = new source("aaaa");
      scope.stateStream.close = sinon.spy();
      $service.loadDeviceState(scope, 2);
      expect(scope.stateStream).to.exist();
      expect(scope.stateStream.url).to.equal("/devices/2/states?stream=1&interval=10");
      expect(oldStream.close).to.have.been.called;
    });

    it("should add event listener", function() {
      $service.loadDeviceState(scope, 2);
      expect(scope.stateStream.addEventListener).to.have.been.calledWith("message", sinon.match.func, false);
    });

    it("should update state when message received", function() {
      scope.$apply = sinon.spy();
      $service.loadDeviceState(scope, 2);
      scope.stateStream.addEventListener.firstCall.args[1]({ data: JSON.stringify({'outputs':{'a1':10}}) });
      expect(scope.$apply).to.have.been.called;
      scope.$apply.firstCall.args[0]();
      expect(scope.state).to.exist();
      expect(scope.state.outputs).to.exist();
      expect(scope.state.outputs.a1).to.equal(10);
    });

    it("should close stream if location changed", function() {
      var onSpy = sinon.spy();
      scope.$on = sinon.stub().returns(onSpy);
      $service.loadDeviceState(scope, 2);
      scope.$on.firstCall.args[1]();
      expect(scope.stateStream.close).to.have.been.called;
      expect(onSpy).to.have.been.called;
    });
  });
});
