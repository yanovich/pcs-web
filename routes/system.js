/* routes/system.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var System = require('../models/system');
var Device = require('../models/device');
var auth = require('./_auth');
var perPage = 25;

module.exports.load = function (req, res, next, id) {
  System.findOne({ _id: id }, function (err, system) {
    if (err || !system)
      return res.send(404);

    req.system = system;
    next();
  })
}

function requireAdmin(req, res, next) {
  if (req.operator.admin)
    return next();
  res.send(401);
}

var exportFields = '_id device site name outputs setpoints';

function showSystem(req, res) {
  if (!req.system)
    return res.send(404);
  var system = {};
  exportFields.split(' ').forEach(function (f) {
    system[f] = req.system[f];
  });
  res.json_ng(system);
}

function showSetpoints(req, res) {
  if (!req.device)
    return res.send(404);
  System.find({ 'device': req.device._id })
    .exec(function (err, systems) {
      if (err) {
        return res.json(500, err);
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
      res.json_ng(setpoints);
    });
}

var systemFields = ['name', 'device', 'outputs', 'setpoints'];

function updateSetpoints(req, res) {
  var dirty = false;
  var bad = false;
  Object.keys(req.system.setpoints).forEach(function (s) {
    if (typeof req.body.setpoints[s] != 'string' &&
      typeof req.body.setpoints[s] != 'number') {
      console.log(typeof req.body.setpoints[s]);
      bad = true;
      return;
    }
    if (req.system.setpoints[s] != req.body.setpoints[s]) {
      dirty = true;
      req.system.setpoints[s] = req.body.setpoints[s];
      req.system.markModified('setpoints.'+s);
    }
  });
  if (!dirty) return res.send(500, 'Unchanged');
  if (bad) return res.send(500, 'Malformed');
  req.system.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json_ng(req.system);
  });
}

function updateSystem(req, res) {
  if (!req.system)
    return res.send(500);
  if (!req.operator.admin) return updateSetpoints(req, res);
  systemFields.forEach(function (f) {
    req.system[f] = req.body[f];
  });
  req.system.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json_ng(req.system);
  });
}

function indexSystems(req, res) {
  if (!req.site)
    return res.send(404);
  var page = Number(req.query.page) || 1;
  page--;
  if (page < 0)
    page = 0;
  System.find({site: req.site._id}).count(function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * perPage) > count)
      page = Math.floor((count - 1) / perPage);
    System
    .find({site: req.site._id}, exportFields)
    .sort({ name: 1 })
    .skip(page*perPage)
    .limit(perPage)
    .exec(function (err, systems) {
      if (err)
        return res.send(500, err.toString());
      systems.push({ count: count });
      res.json_ng(systems);
    });
  });
}

function createSystem(req, res) {
  if (!req.site)
    return res.send(500);
  req.system = new System();
  req.system.site = req.site._id;
  systemFields.forEach(function (f) {
    req.system[f] = req.body[f];
  });
  req.system.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.system);
  });
}

module.exports.show = [ auth.authenticate,
                        showSystem];

module.exports.setpoints = [ auth.authenticate,
                             showSetpoints ];

module.exports.update = [ auth.authenticate,
                          updateSystem];

module.exports.index = [ auth.authenticate,
                         indexSystems];

module.exports.create = [ auth.authenticate,
                          requireAdmin,
                          createSystem];

// vim:ts=2 sts=2 sw=2 et:
