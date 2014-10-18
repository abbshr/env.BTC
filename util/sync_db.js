var path = require('path');

function sync(db) {
  return function (Address) {
    console.log('Address Sync ...');
    var level = require('levelup');
    var odb_path, ndb_path = path.join(process.cwd(), '..', 'insight-db/addr');
    /* origin db */
    var odb = db;
    /* new db */
    var ndb = level(ndb_path);

    if (!db) {
      odb_path = process.argv[2] || path.join(process.cwd(), '..', 'insight-db/txs');
      odb = level(odb_path);
    } else {
      odb = db;
    }
    
    var ndbws = ndb.createWriteStream()
                .on('error', function (err) { console.log(err); })
                .on('close', function () { console.log('WriteStream Closed'); });

    //var addr_set = [];

    var syncToDb = function (data) {
      // sync logic
      var addr = data.split('-')[1];
      //if (addr_set.indexOf(addr) == -1) {
        //addr_set.push(addr);
        var a = new Address(addr);
        a.update(function (err) {
          if (err)
            console.log(err);
          else
            ndbws.write({ 
            key: addr, 
            value: {
              balance: a.balanceSat,
              totalRecv: a.totalReceivedSat,
              totalSpent: a.totalSentSat
            } 
          });
          console.log('save address:', addr);
        });
      //}
    };

    odb.createKeyStream({
        start: 'txa2-'
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
  };
}

module.exports = sync;
