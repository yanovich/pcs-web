/* config.js -- application configuration
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var test = {
  port: 0,
  dbUrl: 'mongodb://localhost:27017/pcs_web-test',
  secret: '0GBlJZ9EKBt2Zbi2flRPvztczCewBxXK',
  slavesCount: 1,
  logTo: [
    {
      name: 'Console',
      options: {
        level: 'info',
        colorize: true,
      },
    },
  ],
};

var dev = {
  port: 3000,
  dbUrl: 'mongodb://localhost:27017/pcs_web-dev',
  secret: '0GBlJZ9EKBt2Zbi2flRPvztczCewBxXK',
  slavesCount: require('os').cpus().length,
  logTo: [
    {
      name: 'Console',
      options: {
        level: 'info',
        colorize: true,
      },
    },
    {
      name: 'File',
      options: {
        level: 'info',
        filename: 'pcsweb_dev.log',
        maxsize: 10 * 1024 * 1024, //10 Mb
      },
    },
  ],
};

var conf;

if (process.env.NODE_ENV === 'test') {
  conf = test;
} else if (process.env.NODE_ENV === 'production') {
  try {
    conf = require('/etc/pcsweb.js');
  }
  catch (e) {
    conf = {};
  }
  conf.log = conf.log || '/var/log/node/pcsweb';
  conf.port = conf.port || 3000;
  conf.dbUrl = conf.dbUrl || 'mongodb://localhost:27017/pcsweb';
  conf.secret = conf.secret || dev.secret;
  conf.slavesCount = conf.slavesCount || require('os').cpus().length;
  conf.logTo = conf.logTo || [
    {
      name: 'Console',
      options: {
        level: 'info',
        colorize: true,
      },
    },
    {
      name: 'File',
      options: {
        level: 'info',
        filename: conf.log,
        maxsize: 10 * 1024 * 1024, //10 Mb
      },
    },
  ];
} else {
  conf = dev;
}

// Allow environment to override config
if (process.env.PORT || process.env.PORT === 0)
  conf.port = process.env.PORT;

module.exports = conf;

// vim:ts=2 sts=2 sw=2 et:

