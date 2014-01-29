/* server.js -- main application file, run it with node.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('Welcome');
});

app.listen(3000);

// vim:ts=2 sts=2 sw=2 et:
