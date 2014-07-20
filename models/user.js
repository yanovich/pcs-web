/* models/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var validates = require('./_validates');

var user_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: validates.length({ max: 50 }),
      msg: 'name is too long' },
    trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-z\d][\w+\-.]*@[a-z\d\-]+(?:\.[a-z\d\-]+)*\.[a-z]+$/i,
    trim: true },
  admin: {
    type: Boolean,
    default: false },
  hash : {
    type: String,
    validate: {
      validator: validates.password({ length: { min: 6 } } ) },
    default: '' }
});

user_schema.virtual('password').get(function () {
  return this._password;
});

user_schema.virtual('password').set(function (value) {
  this._password = value;
});

user_schema.virtual('confirmation').get(function () {
  return this._confirmation;
});

user_schema.virtual('confirmation').set(function (value) {
  this._confirmation = value;
});

user_schema.methods = {
  authenticate: function (password, cb) {
    bcrypt.compare(password, this.hash, cb);
  },

  encrypt: function (password, cb) {
    bcrypt.hash(password, 1, cb);
  }
}

user_schema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});

user_schema.pre('save', function (next) {
  var self = this;
  if (!this._password)
    return next();
  this.encrypt(this._password, function (err, hash) {
    self.hash = hash;
    next();
  });
});

user_schema.index({ name: 1 });

var User = mongoose.model('User', user_schema);

module.exports = User;

// vim:ts=2 sts=2 sw=2 et:
