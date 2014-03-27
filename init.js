/* init.js -- populate development database
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('./app');
var Faker = require('Faker');
var User = require('./models/user');

var userAttrs = { name: "Янович Сергей Владимирович", email: "ynvich@example.com",
      password: 'foobar', confirmation: 'foobar' }

var i = 1;

function addUser(err)
{
  if (err) {
    console.log(err);
    process.exit(1);
  }

  if (i++ === 30)
    process.exit(0);

  userAttrs.name = Faker.Name.findName();
  userAttrs.email = 'user-' + i + '@example.com';
  var user = new User(userAttrs);
  user.save(addUser);
}

User.count(function (err, count) {
  var root;
  if (err) {
    console.log(err);
    process.exit(1);
  }

  if (count > 30) {
    console.log(count);
    process.exit(1);
  }

  User.remove(function (err) {
    root = new User(userAttrs);
    root.save(addUser);
  })
});
