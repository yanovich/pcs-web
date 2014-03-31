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

function requireAdminOrSelf(req, res, next) {
  if (req.operator.admin)
    return next();
  if (req.operator._id.equals(req.user._id))
    return next();
  res.redirect('/users/' + req.operator._id);
}

function showUser(req, res) {
  res.render('users/show', {
    action: '/users/' + req.user._id,
    active: 'users',
    user: req.user,
    _method: 'put',
    title: req.user.name
  })
}

var userFields = ['name', 'email', 'password', 'confirmation'];

function updateUser(req, res) {
  userFields.forEach(function (f) {
    req.user[f] = req.body[f];
  });
  if (req.operator.admin && !req.operator._id.equals(req.user._id))
    req.user.admin = !!req.body['admin'];
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

function newUser(req, res) {
  if (!req.user) req.user = new User();
  res.render('users/show', {
    action: '/users',
    active: 'users',
    user: req.user,
    title: res.locals.t('user.new')
  })
}

function createUser(req, res) {
  req.user = new User();
  userFields.forEach(function (f) {
    req.user[f] = req.body[f];
  });
  if (req.operator.admin && !req.operator._id.equals(req.user._id))
    req.user.admin = !!req.body['admin'];
  req.user.save(function (err) {
    if (err) {
      console.log(err);
      res.locals.err = err;
      if (err.errors && Object.keys(err.errors).length)
        res.locals.messages.push({ severity: 'danger',
          key: 'flash.update.error',
          options: { count: Object.keys(err.errors).length } });
      return newUser(req, res);
    }
    req.session.messages.push({ severity: 'success',
      key: 'flash.create.success' });
    res.redirect('/users/' + req.user._id);
  });
}

module.exports.show = [ auth.authenticate,
                        requireAdminOrSelf,
                        showUser];

module.exports.update = [ auth.authenticate,
                          requireAdminOrSelf,
                          updateUser];

module.exports.index = [ auth.authenticate,
                         requireAdmin,
                         indexUsers];

module.exports.new = [ auth.authenticate,
                       requireAdmin,
                       newUser];

module.exports.create = [ auth.authenticate,
                          requireAdmin,
                          createUser];

// vim:ts=2 sts=2 sw=2 et:
