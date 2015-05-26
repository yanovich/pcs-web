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
      title: 'Sign in',
      returnTo: req.query.returnTo
    });
  }
  if (!req.session.operator)
    return renderNew();

  auth.loadOperatorFromSession(req, res, function () {
    if (req.operator)
      return res.redirect('/');

    req.session.operator = undefined;
    return renderNew();
  })
}

module.exports.new = sessionNew;

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
    req.session.operator = req.operator.email;
    if (req.body.returnTo) {
      res.redirect(req.body.returnTo);
    } else {
      res.redirect('/');
    }
  });
}

module.exports.create = [auth.loadOperatorByEmail,
                         createSession];

function destroySession(req, res) {
    req.session.operator = undefined;
    res.redirect('/signin');
}

module.exports.destroy = [auth.authenticate,
                         destroySession];
// vim:ts=2 sts=2 sw=2 et:
