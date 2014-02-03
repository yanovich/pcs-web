/* test/models/user.js -- test User model
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/pcs_web-test');

process.on('exit', function() {
  mongoose.connection.close();
});

// vim:ts=2 sts=2 sw=2 et:
