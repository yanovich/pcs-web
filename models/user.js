/* models/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');

var user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true },
  email: {
    type: String,
    required: true,
    trim: true }
});

var User = mongoose.model('User', user_schema);

module.exports = User;

// vim:ts=2 sts=2 sw=2 et:
