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
    ref: 'Device'
  },
  stamp: Date,
  outputs: {}
});

state_schema.index({ device: 1, stamp: -1, _id: 1 });

var State = mongoose.model('State', state_schema);

module.exports = State;

// vim:ts=2 sts=2 sw=2 et:
