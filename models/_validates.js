/* models/_validates.js -- validations
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Length = function () {}

Length.prototype.max = function (max_len) {
  return function (value) {
    return value.length <= max_len;
  }
}

var Validations = function () {
  this.length = new Length;
}

module.exports = new Validations;

// vim:ts=2 sts=2 sw=2 et:
