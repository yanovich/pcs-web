/* routes/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');
var auth = require('./_auth');

module.exports.load = function (req, res, next, id) {
  User.findOne({ _id: id }, function (err, user) {
    req.user = user;
    next();
  })
}

function showUser(req, res) {
  res.render('users/show', {
    active: 'users',
    user: req.user,
    title: req.user.name
  })
}

var userFields = ['name', 'email'];

function updateUser(req, res) {
  userFields.forEach(function (f) {
    req.user[f] = req.body[f];
  });
  req.user.save(function (err) {
    if (err) {
      res.locals.err = err;
      if (err.errors && Object.keys(err.errors).length)
        res.locals.messages.push({ severity: 'danger',
          key: 'flash.update.error',
          options: { count: Object.keys(err.errors).length } });
      return showUser(req, res);
    }
    req.session.messages.push({ severity: 'success',
      key: 'flash.update.success' });
    res.redirect('/users/' + req.user._id);
  });
}

function indexUsers(req, res) {
  User.find().exec(function (err, users) {
    res.render('users/index', {
      users: users,
      active: 'users',
      title: res.locals.t('user.self.plural')
    })
  })
}

module.exports.show = [ auth.authenticate,
                        showUser];

module.exports.update = [ auth.authenticate,
                          updateUser];

module.exports.index = [ auth.authenticate,
                         indexUsers];
// vim:ts=2 sts=2 sw=2 et:
