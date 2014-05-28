/* routes/system.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var System = require('../models/system');
var auth = require('./_auth');
var perPage = 25;

module.exports.load = function (req, res, next, id) {
  System.findOne({ _id: id }, function (err, system) {
    req.system = system;
    next();
  })
}

function requireAdmin(req, res, next) {
  if (req.operator.admin)
    return next();
  res.send(401);
}

var exportFields = '_id device site name';

function showSystem(req, res) {
  if (!req.system)
    return res.send(404);
  var system = {};
  exportFields.split(' ').forEach(function (f) {
    system[f] = req.system[f];
  });
  res.json_ng(system);
}

var systemFields = ['name', 'device'];

function updateSystem(req, res) {
  if (!req.system)
    return res.send(500);
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

module.exports.update = [ auth.authenticate,
                          requireAdmin,
                          updateSystem];

module.exports.index = [ auth.authenticate,
                         indexSystems];

module.exports.create = [ auth.authenticate,
                          requireAdmin,
                          createSystem];

// vim:ts=2 sts=2 sw=2 et:
