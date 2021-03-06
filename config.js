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
  saEmail: "root@asutp.io",
  saPasswordHash: "$2a$04$jiT24NfaP7h1BL.cNDKY6.Kif67t1v1EIXc6M6IogRfkOnj4yx5f.", /*0987654321*/
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
  saEmail: "root@asutp.io",
  saPasswordHash: "$2a$04$VQudF4IVjqTH6Mhp0xjlj.oNIrgua4F6qVHOtcQ5RQOLE77b6riUa", /*1234567890*/
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
        filename: '/tmp/pcsweb_dev.log',
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
  conf.saEmail = conf.saEmail || dev.saEmail;
  conf.saPasswordHash = conf.saPasswordHash || dev.saPasswordHash;
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

//Configuration SuperadminID
conf.saId = '403e74ca71796f5d6efa049b'; //autogenerated require('crypto').randomBytes(12).toString('hex')

module.exports = conf;
