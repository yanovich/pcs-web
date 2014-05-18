/* models/state.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var Device = require('./device');

var state_schema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device' },
  content: {
    type: String,
    required: true,
    trim: true }
});

var State = mongoose.model('State', state_schema);

module.exports = State;

// vim:ts=2 sts=2 sw=2 et:
