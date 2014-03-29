/* routes/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');
var auth = require('./_auth');
var per_page = 25;

module.exports.load = function (req, res, next, id) {
  User.findOne({ _id: id }, function (err, user) {
    req.user = user;
    next();
  })
}

function requireAdmin(req, res, next) {
  if (req.operator.admin)
    return next();
  res.redirect('/users/' + req.operator._id);
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
  var page = Number(req.query.page) || 0;
  User.count(function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * per_page) > count)
      page = Math.floor((count - 1) / per_page);
    User
    .find().sort({ name: 1 }).skip(page*per_page).limit(per_page)
    .exec(function (err, users) {
      if (err)
        return res.send(500, err.toString());
      var prev = '#';
      var next = '#';
      var last;
      if (page > 0)
        prev = '/users?page=' + (page - 1);
      if (per_page * (page + 1) < count) {
        next = '/users?page=' + (page + 1);
        last = per_page * (page + 1);
      } else {
        last = count;
      }
      res.render('users/index', {
        pager: {
          firstItem: page * per_page + 1,
          lastItem:  last,
          count: count,
          prev: prev,
          next: next
        },
        users: users,
        active: 'users',
        title: res.locals.t('user.self.plural')
      })
    });
  });
}

module.exports.show = [ auth.authenticate,
                        showUser];

module.exports.update = [ auth.authenticate,
                          updateUser];

module.exports.index = [ auth.authenticate,
                         requireAdmin,
                         indexUsers];
// vim:ts=2 sts=2 sw=2 et:
