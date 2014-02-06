/* test/views/user.js -- test user pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var request = require('supertest');
var expect = require('expect.js');

var app = require('../../app');
var server = request(app);

var User = require('../../models/user');
var userAttrs = { name: "Example User1", email: "user-1@example.com",
      password: 'password', confirmation: 'password' }

describe('User#show page', function(){
  var user;

  before( function (done) {
    user = new User(userAttrs);
    user.save(done);
  });

  it('should display user', function(done){
    server
      .get('/users/' + user._id.toString())
      .expect(200)
      .expect(new RegExp(user.name))
      .expect(new RegExp(user.email))
      .end(done);
  })
});

// vim:ts=2 sts=2 sw=2 et:
