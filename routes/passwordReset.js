/* routes/passwordReset.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');
var crypto = require('crypto');
var mailer = require('./_mailer');

controller = {};

controller._renderNew = function(res) {
  res.render('password_reset/new', {
    title: 'Reset password'
  });
}

controller._renderEdit = function(res) {
  res.render('password_reset/edit', {
    title: 'Change password'
  });
}

controller.new = function(req, res) {
  if (!req.session.operatorId)
    return controller._renderNew(res);

  User.findOne({ _id: req.session.operatorId }, function (err, user) {
    if (err)
      return res.send(500, 'Sorry, internal server error.');

    if (user)
      return res.redirect('/');

    return controller._renderNew(res);
  })
};

controller.create = function(req, res) {
  function sendMailFailed() {
    res.locals.err = { errors: { email: { type: 'missing' } } };
    controller._renderNew(res);
  }
  function sendInternalError(err) {
    console.error(err);
    return res.send(500, 'Sorry, internal server error.');
  }
  User.findOne({ email: req.body.email }, function(err, user) {
    if (!user)
      return sendMailFailed();

    user.generateResetPasswordToken(function(err, token) {
      if (err) {
        return sendInternalError(err);
      }
      var mailOptions = {
        to: user.email,
        from: 'noreply@asutp.io',
        subject: req.t('password_reset.mail.token.subject'),
        text: req.t('password_reset.mail.token.body', {link: 'http://' + req.headers.host + '/reset/' + token})
      };
      mailer.send(mailOptions, function(err) {
        if (err) {
          return sendInternalError(err);
        }
        res.locals.notify = { message: req.t('password_reset.token.notify', {email: user.email}) };
        controller._renderNew(res);
      });
    });
  });
};

controller.edit = function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.send(500, "Sorry, internal server error.");
    }
    controller._renderEdit(res);
  });
};

controller.update = function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.send(500, "Sorry, internal server error.");
    }
    user.resetPassword(req.body.password, req.body.confirmation, function(err) {
      if (err) {
        console.error(err);
        return res.send(500, "Sorry, internal server error.");
      }
      var mailOptions = {
        to: user.email,
        from: 'noreply@asutp.io',
        subject: req.t('password_reset.mail.reset.subject'),
        text: req.t('password_reset.mail.reset.body', { user: user.email})
      };
      mailer.send(mailOptions, function(err) {
        if (err) {
          console.error(err);
          return res.send(500, "Sorry, internal server error.");
        }
        res.redirect('/signin');
      });
    });
  });
};

exports = module.exports = controller;

// vim:ts=2 sts=2 sw=2 et:
