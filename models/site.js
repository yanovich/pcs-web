/* models/site.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var validates = require('./_validates');

var site_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length({ max: 50 }),
      msg: 'name is too long' },
    trim: true }
});

site_schema.index({ name: 1 }, { unique: 1 });

var Site = mongoose.model('Site', site_schema);

module.exports = Site;

// vim:ts=2 sts=2 sw=2 et:

