/* routes/session.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

module.exports = function (app) {
  app.get('/signin', function (req, res) {
    res.render('sessions/new', {
      title: 'Sign in'
    })
  });
}

// vim:ts=2 sts=2 sw=2 et:
