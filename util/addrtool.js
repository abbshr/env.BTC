#!/usr/bin/env node
var cluster = require('cluster');
var curhash = '1GHCMMZ';
if (cluster.isMaster) {
  cluster.on('online', function (worker) {
    console.log('worker', worker.id, 'online');
  })
  .on('disconnect', function (worker) {})
  .on('exit', function (worker, code, signal) {
    var worker = cluster.fork();
    worker.on('message', function (msg) {
      if (msg == 'done') {
        worker.exit();
        process.exit();
      } else
        curhash = msg;
    });
    worker.send(curhash);
  });

  var worker = cluster.fork();
  worker.on('message', function (msg) {
    if (msg == 'done') {
      worker.exit();
      process.exit();
    } else
      curhash = msg;
  });
  worker.send(curhash);
} else {
  var addressDb = require('../lib/AddressDb');
  addressDb.historicSync(cluster);
}