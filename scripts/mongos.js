/* scripts/mongos.js -- setup test database with sharding
 * Copyright 2014 Sergei Ianovich
 *
 * Licensed under AGPL-3.0 or later, see LICENSE
 * Process Control Service Web Interface
 */

// add a shard
sh.addShard("127.0.0.1:27018");

// enable sharding
sh.enableSharding('pcs_web-test');

sh.shardCollection('pcs_web-test.users', { "email" : 1 });

sh.shardCollection('pcs_web-test.devices', { "name" : 1 });

sh.shardCollection('pcs_web-test.sites', { "name" : 1 });

sh.shardCollection('pcs_web-test.systems', { "site" : 1, "name" : 1 });

sh.shardCollection('pcs_web-test.states', { "device" : 1, "stamp" : 1 });

// vim:ts=2 sts=2 sw=2 et:
