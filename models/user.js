/* models/user.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');
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
    match: /^[a-z][\w+\-.]+@[a-z\d\-]+(?:\.[a-z\d\-]+)*\.[a-z]+$/i,
    trim: true },
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
    var self = this;
    this.encrypt(password, function (err, hash) {
      var valid = false;
      if (!err && self.hash === hash)
        valid = true;

      cb(err, valid);
    })
  },

  encrypt: function (password, cb) {
    cb(undefined, password); //FIXME: actually hash it
  }
}

user_schema.pre('save', function (next) {
  this.email = this.email.toLowerCase();
  next();
});

user_schema.pre('save', function (next) {
  var self = this;
  this.encrypt(this._password, function (err, hash) {
    self.hash = hash;
    next();
  });
});

var User = mongoose.model('User', user_schema);

module.exports = User;

// vim:ts=2 sts=2 sw=2 et:
