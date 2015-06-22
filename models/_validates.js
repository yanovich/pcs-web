/* models/_validates.js -- validations
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Validations = function () {
  this.length = function (opts) {
    return function (value) {
      var valid = true;

      if (opts['max'])
        if (!value || value.length > opts['max']) {
          valid = false;
          this.invalidate('name', { path: 'name', kind: 'long', count: opts['max'] });
        }

      return valid;
    };
  };

  this.password = function (opts) {
    return function (value) {
      if (this.isNew && (!this._password || this._password.trim() === ''))
        this.invalidate('password',  { path: 'password', kind: 'required' });

      if (this._password || this._confirmation) {
        if (this._password !== this._confirmation)
          this.invalidate('confirmation', { path: 'confirmation', kind: 'mismatch' });

        if (opts['length'])
          if (opts['length']['min'])
            if (this._password.length < opts['length']['min'])
              this.invalidate('password', { path: 'password', kind: 'short', count: opts['length']['min'] });
      }
    };
  };
}

module.exports = new Validations;

// vim:ts=2 sts=2 sw=2 et:
