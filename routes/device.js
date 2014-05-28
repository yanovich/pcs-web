/* routes/device.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Device = require('../models/device');
var auth = require('./_auth');
var perPage = 25;

module.exports.load = function (req, res, next, id) {
  Device.findOne({ _id: id }, function (err, device) {
    req.device = device;
    next();
  })
}

function requireAdmin(req, res, next) {
  if (req.operator.admin)
    return next();
  res.send(401);
}

var exportFields = '_id name input_file output_file';

function showDevice(req, res) {
  if (!req.device)
    return res.send(404);
  var device = {};
  exportFields.split(' ').forEach(function (f) {
    device[f] = req.device[f];
  });
  res.json_ng(device);
}

var deviceFields = ['name', 'input_file', 'output_file'];

function updateDevice(req, res) {
  deviceFields.forEach(function (f) {
    req.device[f] = req.body[f];
  });
  req.device.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.device);
  });
}

function indexDevices(req, res) {
  var search = {};
  var page = Number(req.query.page) || 1;
  if (req.query.name && req.query.name !== '')
    search['name'] = req.query.name;
  page--;
  if (page < 0)
    page = 0;
  Device.count(search, function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * perPage) > count)
      page = Math.floor((count - 1) / perPage);
    Device
    .find(search, exportFields).sort({ name: 1 }).skip(page*perPage).limit(perPage)
    .exec(function (err, devices) {
      if (err)
        return res.send(500, err.toString());
      devices.push({ count: count });
      res.json_ng(devices);
    });
  });
}

function createDevice(req, res) {
  req.device = new Device();
  deviceFields.forEach(function (f) {
    req.device[f] = req.body[f];
  });
  req.device.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.device);
  });
}

module.exports.show = [ auth.authenticate,
                        showDevice];

module.exports.update = [ auth.authenticate,
                          requireAdmin,
                          updateDevice];

module.exports.index = [ auth.authenticate,
                         indexDevices];

module.exports.create = [ auth.authenticate,
                          requireAdmin,
                          createDevice];

// vim:ts=2 sts=2 sw=2 et:
