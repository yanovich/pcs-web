/* routes/_auth.js -- authentication middleware
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');

module.exports.loadOperatorFromSession = function (req, res, next) {
  if (req.root && req.session.operator == req.root.email) {
    req.operator = req.root;
    return next();
  }
  User.findOne({ email: req.session.operator }, function (err, user) {
    if (err) {
      console.log(err);
      req.session.operator = undefined;
      return res.send(500, 'Sorry, internal server error.');
    }

    req.operator = user;
    next();
  })
}

module.exports.loadOperatorByEmail = function (req, res, next) {
  if (!req.body || !req.body.email) return next();

  if (req.root && req.body.email.toLowerCase() == req.root.email) {
    req.operator = req.root;
    return next();
  }
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err)
      return res.send(500, 'Sorry, internal server error.');

    req.operator = user;
    next();
  })
}

module.exports.authenticate = function (req, res, next) {
  function goSignin() {
    if (req.url === '/' || (req.headers.accept && req.headers.accept.indexOf('html') !== -1)) {
      return res.redirect('/signin');
    } else {
      return res.send(401, 'Unauthorized');
    }
  }
  if (!req.session.operator) {
    return goSignin();
  }

  if (req.root && req.session.operator == req.root.email) {
    res.locals.operator = req.operator = req.root;
    return next();
  }

  User.findOne({ email: req.session.operator }, function (err, user) {
    if (err)
      return res.send(500, 'Sorry, internal server error.');

    if (!user) {
      return goSignin();
    }

    res.locals.operator = req.operator = user;
    next();
  })
}

module.exports.requireAdmin = function (req, res, next) {
  if (!req.operator)
    return res.send(401);
  if (req.operator.admin)
    return next();
  res.send(403);
}
