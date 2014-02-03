/* models/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');

var User = new mongoose.Schema({
  name: String,
  email: String
});

module.exports = mongoose.model('User', User);

// vim:ts=2 sts=2 sw=2 et:
