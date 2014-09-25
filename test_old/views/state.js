/* test/views/state.js -- test state pages, run it with mocha
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var expect = require('expect.js');
var http = require('http');

describe('State', function () {
  describe('reporting by device', function () {
    it('should work', function (done) {
      var i = 0;
      var req = http.request({ port: parseInt(global.url.split(':')[2]),
        path: '/states',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-device-data',
          'Transfer-Encoding': 'chunked' }
      });
      req.on('response', function onData(res) {
        res.on('data', function (chunk) {
          if (++i > 3)
            req.end();
          else
            req.write(i.toString());
        });
        res.once('end', onEnd);
        res.once('error', onEnd);
        res.once('close', cleanup);

        function onEnd(err) {
          cleanup();
        }

        function cleanup(err) {
          res.removeListener('data', onData);
          res.removeListener('end', onEnd);
          res.removeListener('error', onEnd);
          res.removeListener('close', cleanup);
          done();
        }
      });
      req.write(i.toString());
    })
  })
});

// vim:ts=2 sts=2 sw=2 et:
