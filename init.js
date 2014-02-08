/* init.js -- populate development database
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('./app');
var User = require('./models/user');

var userAttrs = { name: "Янович Сергей Владимирович", email: "ynvich@example.com",
      password: 'foobar', confirmation: 'foobar' }


User.findOne({ email: userAttrs.email }, function (err, user) {
  var root;
  if (err) {
    console.log(err);
    process.exit(1);
  }

  if (user) {
    console.log(user);
    process.exit(1);
  }

  root = new User(userAttrs);
  root.save(function (err) {

    if (err) {
      console.log(err);
      process.exit(1);
    }

    process.exit(0);
  });
});
