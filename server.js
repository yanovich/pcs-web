/* server.js -- main application file, run it with node.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var app = require('./app')

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// vim:ts=2 sts=2 sw=2 et:
