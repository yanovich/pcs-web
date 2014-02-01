/* test/server.js -- test main application, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('../app');
var request = require('supertest');
var server = request(app);

describe('root page', function(){
  it('should contain logo', function(done){
    server
      .get('/')
      .expect(200)
      .expect(/asutp\.io/)
      .end(done)
  })
});

// vim:ts=2 sts=2 sw=2 et:
