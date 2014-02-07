/* test/views/session.js -- test session pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var request = require('supertest');
var expect = require('expect.js');

var server = request(global.url);

describe('signin page', function() {
  it('should display prompt', function(done) {
    server
      .get('/signin')
      .expect(200)
      .expect(new RegExp('Sign in'))
      .end(done);
  })
});

// vim:ts=2 sts=2 sw=2 et:
