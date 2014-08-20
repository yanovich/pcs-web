/* config.js -- application configuration
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var winston = require('winston'),
    logger = null;

module.exports = {
  enable: function(options) {
    if (logger === null && options.transports) {
      var transports = options.transports.map(function(item) {
        item.options["handleExceptions"] = item.options["handleExceptions"] || true;
        return new (winston.transports[item.name])(item.options);
      });
      logger = new (winston.Logger)({ transports: transports, exitOnError: false });
    }
    return logger;
  },
  logProcess: function(proc) {
    if (proc) {
      var messageHeader = null;
      if (process.pid === proc.pid) {
        messageHeader = "Master: ";
      } else {
        messageHeader = "Worker " + proc.pid + ": ";
      }
      proc.stdout.on('data', function(chunk) {
        logger.info(messageHeader + chunk);
      });
      proc.stderr.on('data', function(chunk) {
        logger.warn(messageHeader + chunk);
      });
    }
  },
};


