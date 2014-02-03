/* test/models/user.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var User = require('../../models/user');

describe('User', function(){
  var user = new User({ name: "Example User", email: "user@example.com" });
  it('should respond to name', function(){
    expect(user.name).not.to.be.an('undefined');
  });

  it('should respond to email', function(){
    expect(user.email).not.to.be.an('undefined');
  });
});

// vim:ts=2 sts=2 sw=2 et:
