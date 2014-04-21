/* routes/state.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

module.exports.create = function (req, res, next) {
  if (req.method !== 'POST')
    return next();
  if (req.headers['content-type'] !== 'application/x-device-data')
    return next();

  req.on('data', onData);
  req.once('end', onEnd);
  req.once('error', onEnd);
  req.once('close', cleanup);

  res.writeHead(200);
  return

  function onData(chunk) {
    res.write(chunk.toString());
  }

  function onEnd(err) {
    res.end();
    if (err)
      console.log(err);
    cleanup();
  }

  function cleanup() {
    req.removeListener('data', onData);
    req.removeListener('end', onEnd);
    req.removeListener('error', onEnd);
    req.removeListener('close', cleanup);
  }
}
// vim:ts=2 sts=2 sw=2 et:
