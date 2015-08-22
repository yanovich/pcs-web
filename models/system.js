/* models/system.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var validates = require('./_validates');

var system_schema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Site'
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Device'
  },
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length({ max: 50 }),
      msg: 'name is too long'
    },
    trim: true
  },
  outputs: [String],
  setpoints: {}
});

system_schema.index({ site: 1, name: 1 }, { unique: 1 });
system_schema.index({ device: 1, _id: 1 });

var System = mongoose.model('System', system_schema);

module.exports = System;
