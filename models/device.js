/* models/device.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var validates = require('./_validates');

var device_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length({ max: 50 }),
      msg: 'name is too long' },
    trim: true },
  input_file: {
    type: String,
    required: true,
    trim: true },
  output_file: {
    type: String,
    required: true,
    trim: true }
});

var Device = mongoose.model('Device', device_schema);

module.exports = Device;

// vim:ts=2 sts=2 sw=2 et:

