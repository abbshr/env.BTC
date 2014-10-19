#!/usr/bin/env node

var path = require('path');

function sync(db) {
  
  console.log('Address Sync ...');
  var level = require('levelup');
  var odb_path, ndb_path = path.join(__dirname, '../../../../', 'insight-db/addrs');
  /* origin db */
  var odb = db;
  /* new db */
  var ndb = level(ndb_path);

  var syncToDb = function (data) {
    // sync logic
    var addr = data.split('-')[1];
    ndb.put(addr, 0);
    console.log('save address:', addr);
  };

  if (!db) {
    odb_path = process.argv[2] || path.join(__dirname, '../../../../', 'insight-db/txs');
    odb = level(odb_path);
  } else {
    odb = db;
  }

  odb.createKeyStream({
      start: 'txa2-', 
      end: 'txa2-~'
    })
    .on('data', function (d) {
      syncToDb(d);
    })
    .on('error', function (err) {
      err && console.log(err);
    })
    .on('end', function () {
      ndbws.end();
      console.log('Read End');
    })
    .on('close', function () {
      console.log('ReadStream Closed');
    });
}

module.exports = sync;
sync();
