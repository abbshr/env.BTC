var leveldb = require('levelup');
var odb_path = '';
var ndb_path = '';
/* origin db */
var odb = levelup(odb_path);
/* new db */
var ndb = levelup(ndb_path);
var ndbws = ndb.createWriteStream()
            .on('');
var syncToDb = function (data) {
  // sync logic
};

odb.createReadStream()
  .on('data', function (d) {
    syncToDb(d);
  })
  .on('error', function (err) {
    err && console.log(err);
  })
  .on('end', function () {
    console.log('Read End');
  })
  .on('close', function () {
    console.log('ReadStream Closed');
  });