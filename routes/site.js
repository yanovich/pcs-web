/* routes/site.js
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var Site = require('../models/site');
var auth = require('./_auth');
var perPage = 25;

module.exports.load = function (req, res, next, id) {
  Site.findOne({ _id: id }, function (err, site) {
    if(err) return res.send(404, err);
    req.site = site;
    next();
  })
}

var exportFields = '_id name';

function showSite(req, res) {
  if (!req.site)
    return res.send(404);
  var site = {};
  exportFields.split(' ').forEach(function (f) {
    site[f] = req.site[f];
  });
  res.json_ng(site);
}

var siteFields = ['name'];

function updateSite(req, res) {
  res.json(500, 'Not implemented');
}

function indexSites(req, res) {
  var page = Number(req.query.page) || 1;
  page--;
  if (page < 0)
    page = 0;
  Site.count(function (err, count) {
    if (err)
      return res.send(500, err.toString());
    if ((page * perPage) > count)
      page = Math.floor((count - 1) / perPage);
    Site
    .find({}, exportFields).sort({ name: 1 }).skip(page*perPage).limit(perPage)
    .exec(function (err, sites) {
      if (err)
        return res.send(500, err.toString());
      sites.push({ count: count });
      res.json_ng(sites);
    });
  });
}

function createSite(req, res) {
  req.site = new Site();
  siteFields.forEach(function (f) {
    req.site[f] = req.body[f];
  });
  req.site.save(function (err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(req.site);
  });
}

module.exports.show = [ auth.authenticate,
                        showSite];

module.exports.update = [ auth.authenticate,
                          auth.requireAdmin,
                          updateSite];

module.exports.index = [ auth.authenticate,
                         indexSites];

module.exports.create = [ auth.authenticate,
                          auth.requireAdmin,
                          createSite];
