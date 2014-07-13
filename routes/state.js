/* routes/state.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Device = require('../models/device');
var State = require('../models/state');
var System = require('../models/system');
var auth = require('./_auth');
var perPage = 25;

module.exports.create = function (req, res, next) {
  var device = null;
  if (req.method !== 'PUT')
    return next();
  if (req.headers['content-type'] !== 'application/x-device-data')
    return next();

  req.on('data', onData);
  req.once('end', onEnd);
  req.once('error', onEnd);
  req.once('close', cleanup);

  return

  function onData(chunk) {
    var input;

    if (chunk.toString() === '\n') {
      if (device) {
        res.write("\n");
      }
      return;
    }

    try {
      input = JSON.parse(chunk.toString(), {});
    }
    catch (e) {
      res.write(toString());
      return;
    }

    if (!device) {
      if (!input.device) {
        res.send(500);
        cleanup();
        return;
      }

      Device.findOne({ _id: input.device }, function (err, d) {
        if (err || !d) {
          res.send(500);
          cleanup();
          return;
        }
        device = d;
        res.writeHead(200);
        res.write("ok");
      });
      return;
    }
    System.find({ 'device': device._id })
      .exec(function (err, systems) {
        if (err) {
          return;
        }
        var setpoints = {};
        systems.forEach(function (system) {
          if (system.setpoints) {
            Object.keys(system.setpoints).forEach(function (s) {
              if (system.setpoints.hasOwnProperty(s)) {
                setpoints[s] = system.setpoints[s];
              }
            });
          }
        });
        var text = JSON.stringify(setpoints);
        res.write(text);
      });
    var state = new State;
    state.device = device._id;
    state.stamp = new Date;
    state.outputs = input;
    state.markModified('outputs');
    state.save();
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

var exportFields = '_id device stamp outputs';

function indexStates(req, res) {
  if (!req.device)
    return res.send(404);
  var page = Number(req.query.page) || 1;
  var limit =  Number(req.query.limit) || perPage;
  page--;
  if (page < 0)
    page = 0;
  State.find({device: req.device._id}).count(function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * perPage) > count)
      page = Math.floor((count - 1) / perPage);
    State
    .find({device: req.device._id}, exportFields)
    .sort({ stamp: -1 })
    .skip(page*perPage)
    .limit(limit)
    .exec(function (err, systems) {
      if (err)
        return res.send(500, err.toString());
      systems.push({ count: count });
      res.json_ng(systems);
    });
  });
}

module.exports.index = [ auth.authenticate,
                         indexStates];
// vim:ts=2 sts=2 sw=2 et:
