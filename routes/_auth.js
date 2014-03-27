/* routes/_auth.js -- authentication middleware
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var User = require('../models/user');

module.exports.authenticate = function (req, res, next) {
  if (!req.session.operatorId)
    return res.redirect('/signin');

  User.findOne({ _id: req.session.operatorId }, function (err, user) {
    if (err)
      return res.send(500, 'Sorry, internal server error.');

    if (!user)
      return res.redirect('/signin');

    res.locals.operator = req.operator = user;
    next();
  })
}


// vim:ts=2 sts=2 sw=2 et:
