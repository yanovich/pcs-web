/* config.js -- application configuration
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var test = {
  port: 0,
  dbUrl: 'mongodb://localhost:27017/pcs_web-test',
};

var dev = {
  port: 3000,
  dbUrl: 'mongodb://localhost:27017/pcs_web-dev',
};

var production = {
};

var conf;

if (process.env.NODE_ENV === 'test')
  conf = test;
else if (process.env.NODE_ENV === 'production')
  conf = production;
else
  conf = dev;

// Allow environment to override config
if (process.env.PORT || process.env.PORT === 0)
  conf.port = process.env.PORT;

module.exports = conf;

// vim:ts=2 sts=2 sw=2 et:

