/* test/app/zombie/seed -- seed db
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

var adminAttrs = {
  name: "sg",
  email: "sg@gmail.com",
  password: "password",
  confirmation: "password",
  admin: true
};

function createMultipleUsers(count, next) {
  var user = {
    name: "user#" + count,
    email: "email" + count + "@example.com",
    password: "password",
    confirmation: "password",
  };
  (new User(user)).save(function(err) {
    if (err)
      throw "Error";
    count -= 1;
    if (count > 0) {
      createMultipleUsers(count, next);
    } else {
      next();
    }
  });
}

function createMultipleDevices(count, next) {
  var device = {
    name: "device#" + count,
  };
  (new Device(device)).save(function(err) {
    if (err)
      throw "Error";
    count -= 1;
    if (count > 0) {
      createMultipleDevices(count, next);
    } else {
      next();
    }
  });
}

function createMultipleSites(count, next) {
  var site = {
    name: "site#" + count,
  };
  (new Site(site)).save(function(err) {
    if (err)
      throw "Error";
    count -= 1;
    if (count > 0) {
      createMultipleSites(count, next);
    } else {
      next();
    }
  });
}

function seedUsers(done) {
  User.create(adminAttrs, function(e, newUser) {
    if (e) throw e;
    admin = newUser;
    createMultipleUsers(30, done);
  });
}

function seedDevices(done) {
  createMultipleDevices(28, function() {
    Device.create({name: "z is last device"}, function(err, newDevice) {
      if(err) throw err;
      knownDevice = newDevice;
      Device.create({name: "y is prelast device"}, function(err, newDevice) {
        if(err) throw err;
        otherDevice = newDevice;
        done();
      });
    });
  });
}

function seedSites(done) {
  createMultipleSites(29, function() {
    Site.create({name: "z is last site"}, function(err, newSite) {
      if(err) throw err;
      knownSite = newSite;
      done();
    });
  });
}

function seedSystems(done) {
  var knownSystemAttrs = {
    name: "z is last system",
    site: knownSite._id,
    device: knownDevice._id,
    setpoints: { m1: 1000, m2: "hello" }
  }, otherSystemAttrs = {
    name: "y is prelast system",
    site: knownSite._id,
    device: otherDevice._id,
    setpoints: { m3: "33", m4: -9 }
  };
  System.create(knownSystemAttrs, function(err, system) {
    if(err) throw err;
    knownSystem = system;
    System.create(otherSystemAttrs, function(err, system) {
      if(err) throw err;
      otherSystem = system;
      done();
    });
  });
}

function removeSystems(done) {
  System.remove(done);
}

function removeUsers(done) {
  User.remove(done);
}

function removeDevices(done) {
  Device.remove(done);
}

function removeSites(done) {
  Site.remove(done);
}

module.exports = {
  admin: null,
  operator: null,
  knownDevice: null,
  knownSystem: null,
  otherDevice: null,
  otherSystem: null,
  knownSite: null,


  seed: {
    up: function(done) {
      seedUsers(function() {
        seedDevices(function() {
          seedSites(function() {
            seedSystems(done);
          });
        });
      });
    },
    down: function(done) {
      removeSystems(function() {
        removeSites(function() {
          removeDevices(function() {
            removeUsers(done);
          });
        });
      });
    },
  },
};


