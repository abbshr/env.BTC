var Address = require('../app/models/Address');
var MongoClient = require('mongodb').MongoClient;

var AddressDb = { _cache: [] };

exports.historicSync = function () {
  MongoClient.connect('mongodb://localhost:27017/addrs', { "native_parser": true, "raw": true }, 
    function (err, db) {
      if (err)
        throw err;
      db.collection('address', function (err, c) {
        if (err)
          throw err;
        c.find({
          addrStr : {
            $gt: "13rrveQTfu9BzJ1B2FCUutgXf4kfYh2s5d"
          }
        }).sort({ addrStr: 1 })
        .each(function (err, item) {
          addrUpdate(c, item.addrStr);
          //console.log('update Address:', item.addrStr);
        });
      });
  });
};

function addrUpdate(c, hash) {
  var a = new Address(hash);
  a.update(function (err) {
    if (err) 
      console.log(err);
    else {
      var o = a.getObj();
      a = null;
      c.update({
        'addrStr': o.addrStr
      }, {
        $set: {
          'balanceSat': o.balanceSat,
          'totalReceivedSat': o.totalReceivedSat,
          'totalSentSat': o.totalSentSat,
          'unconfirmedBalanceSat': o.unconfirmedBalanceSat,
          'unconfirmedTxApperances': o.unconfirmedTxApperances,
          'txApperances': o.txApperances
        }
      }, {
        'upsert': true
      }, function (err, result) {
        if (err)
          console.log(err);
        console.log('update Address:', hash);
      });
    }
  }, { txLimit: 0 }); // 不存储txs
}

AddressDb._getCache = function (n) {
  var self = this;
  var count = self._cache.length;
  return n <= count ? self._cache.slice(0, n) : null;
};

AddressDb.getTopNAddress = function (n, callback) {
  MongoClient.connect('mongodb://localhost:27017/addrs', { "native_parser": true, "raw": true }, 
    function (err, db) {
      if (err)
        throw err;
      db.collection('address', function (err, c) {
        c.find().sort({ balanceSat: -1 }).limit(n).toArray(function (err, r) {
          callback(r);
        });
      });
  });

  /*var self = this;
  var arr = [0];

  var cache = self._getCache(n);
  if (cache)
    return callback(cache);

  aDb.createReadStream()
    .on('data', function (d) {
      d.value = JSON.parse(d.value)
      var arr_map = arr.map(function (a) {
        return a.balanceSat || 0;
      });
      var min = Math.min.apply(null, arr_map);
      var len = arr.length;
      var balanceSat = d.value.balanceSat;
      if (balanceSat >= min) {
        d.value.addrStr = d.key;
        if (len < n)
          arr.push(d.value);
        else 
          arr[arr_map.indexOf(min)] = d.value;
      }

    })
    .on('end', function () {
      // cache result
      self._cache = arr.sort(function (a, b) { 
        return b.balanceSat - a.balanceSat; 
      });
      // to stdout
      self._cache.forEach(function (e) {
        console.log(e.addrStr, ':', e.balanceSat, '(satoshis)');
      });
      callback(self._cache);
    });*/
};


//module.exports = AddressDb;
