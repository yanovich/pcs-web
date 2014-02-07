/* routes/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');

module.exports.load = function (req, res, next, id) {
  User.findOne({ _id: id }, function (err, user) {
    req.user = user;
    next();
  })
}

module.exports.show = function (req, res) {
  res.render('users/show', {
    user: req.user,
    title: req.user.name
  })
}

// vim:ts=2 sts=2 sw=2 et:
