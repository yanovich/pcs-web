/* routes/_mailer.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */
var nodemailer = require('nodemailer');
var config = require('../config')

mailer = {}

mailer.send = function(options, callback) {
  console.log(config.mailer);
  var smtpTransport = nodemailer.createTransport(config.mailer);
  console.log("SEND MAIL: ", options);
  smtpTransport.sendMail(options, callback);
};

exports = module.exports = mailer;

// vim:ts=2 sts=2 sw=2 et:
