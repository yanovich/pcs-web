/* routes/session.js
 * Copyright 2015 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');
var auth = require('./_auth');

function sessionNew(req, res) {
  function renderNew () {
    res.render('sessions/new', {
      title: 'Sign in'
    });
  }
  if (!req.session.operatorId)
    return renderNew();

  User.findOne({ _id: req.session.operatorId }, function (err, user) {
    if (err) {
      if (err.name !== 'CastError')
        console.log(err);
      req.session.operatorId = undefined;
      return renderNew();
    }

    if (user)
      return res.redirect('/');

    req.session.operatorId = undefined;
    return renderNew();
  })
}

module.exports.new = sessionNew;

function loadOperatorByEmail(req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err)
      return res.send(500, 'Sorry, internal server error.');

    req.operator = user;
    next();
  })
}

function createSession(req, res) {
  function signinFail() {
    res.locals.err = { errors: { password: { type: 'signin' } } };
    res.render('sessions/new', {
      title: 'Sign in'
    });
  }
  if (!req.operator)
    return signinFail();

  req.operator.authenticate(req.body.password, function (err, valid) {
    if (err)
      return res.send(500, 'Sorry, internal server error.');
    if (!valid)
      return signinFail();
    req.session.operatorId = req.operator._id;
    if (req.session.returnTo) {
      var redirect = req.session.returnTo;
      req.session.returnTo = undefined;
      res.redirect(redirect);
    } else {
      res.redirect('/');
    }
  });
}

module.exports.create = [loadOperatorByEmail,
                         createSession];

function destroySession(req, res) {
    req.session.operatorId = undefined;
    res.redirect('/signin');
}

module.exports.destroy = [auth.authenticate,
                         destroySession];
// vim:ts=2 sts=2 sw=2 et:
