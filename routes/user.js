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
    if (err || !user)
      return res.send(404);
    req.user = user;
    next();
  })
}

function requireAdminOrSelf(req, res, next) {
  if (!req.user)
    return res.send(404);
  if (req.operator.admin)
    return next();
  if (req.operator._id.equals(req.user._id))
    return next();
  res.send(403);
}

function newUser(req, res) {
  function renderRegistration () {
    res.render('users/new', {
      title: 'Sign up'
    });
  }
  if (!req.session.operatorId)
    return renderRegistration();

  User.findOne({ _id: req.session.operatorId }, function (err, user) {
    if (err) {
      if (err.name !== 'CastError')
        console.log(err);
      req.session.operatorId = undefined;
      return renderRegistration();
    }

    if (user)
      return res.redirect('/');

    req.session.operatorId = undefined;
    return renderRegistration();
  })
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

var userUpdateFields = ['name', 'password', 'confirmation'];

function updateUser(req, res) {
  userUpdateFields.forEach(function (f) {
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

var userFields = userUpdateFields.slice(0);
userFields.push('email');

function createUser(req, res) {
  if (req.body) {
    var html = req.body['_html'];
    if (html) return signupUser(req, res);
  }

  auth.authenticate(req, res, function () {
    auth.requireAdmin(req, res, function () {
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
    })
  });
}

function signupUser(req, res) {
  function signupFail(validationError) {
    res.locals.err = validationError;
    res.render('users/new', {
      title: 'Sign up'
    });
  }
  if (req.session.operatorId)
    return res.json(500, {error: 'Sorry, internal server error'});

  req.user = new User();
  userFields.forEach(function (f) {
    req.user[f] = req.body[f];
  });
  req.user.save(function (err) {
    if (err) {
      return signupFail(err);
    }
    req.session.messages = ['flash.create.success']
    res.redirect('/signin');
  });
}


module.exports.new = [ newUser ];

module.exports.show = [ auth.authenticate,
                        requireAdminOrSelf,
                        showUser];

module.exports.update = [ auth.authenticate,
                          requireAdminOrSelf,
                          updateUser];

module.exports.index = [ auth.authenticate,
                         auth.requireAdmin,
                         indexUsers];

module.exports.create = [ createUser];

// vim:ts=2 sts=2 sw=2 et:
