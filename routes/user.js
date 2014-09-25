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
    if (err || !user) return res.send(500);
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

var exportFields = '_id name email admin';

function showUser(req, res) {
  if (!req.user)
    return res.send(404);
  var user = {};
  exportFields.split(' ').forEach(function (f) {
    user[f] = req.user[f];
  });
  res.json_ng(user);
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
      return res.json(500, err);
    }
    res.json(req.user);
  });
}

function indexUsers(req, res) {
  var page = Number(req.query.page) || 1;
  page--;
  if (page < 0)
    page = 0;
  User.count(function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * per_page) > count)
      page = Math.floor((count - 1) / per_page);
    User
    .find({}, exportFields).sort({ name: 1 }).skip(page*per_page).limit(per_page)
    .exec(function (err, users) {
      if (err)
        return res.send(500, err.toString());
      users.push({ count: count });
      res.json_ng(users);
    });
  });
}

function createUser(req, res) {
  req.user = new User();
  userFields.forEach(function (f) {
    req.user[f] = req.body[f];
  });
  if (req.operator.admin)
    req.user.admin = !!req.body['admin'];
  req.user.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.user);
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

module.exports.create = [ auth.authenticate,
                          requireAdmin,
                          createUser];

// vim:ts=2 sts=2 sw=2 et:
