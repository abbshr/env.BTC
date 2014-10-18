var path = require('path');
var Address = require('../app/models/Address');
var level = require('levelup');
var aDb = level(path.join(process.cwd(), '../../../', 'insight-db/addr'));

var AddressDb = { _cache: [] };

AddressDb.historicSync = function () {
  var self = this;
  aDb.createKeyStream()
    .on('data', function (hash) {
      self.addrUpdate(hash);
    })
    .on('error', function (err) {
      console.log(err);
    })
    .on('end' function () {
      console.log('Sync Finished');
    })
    .on('close', function () {
      console.log('ReadStream Closed');
    });
};

AddressDb.addrUpdate = function (hash) {
  var a = new Address(hash);
  a.update(function (err) {
    if (err)
      console.log(err);
    else
      aDb.put(hash, a.getObj(), { valueEncoding: 'json' });
  });
};

AddressDb._getCache = function (n) {
  var self = this;
  var count = self._cache.length;
  return n <= count ? self._cache.slice(0, n) : null;
};

// O(nm)
AddressDb.getTopNAddress = function (n, callback) {
  var self = this;
  var arr = [];

  var cache = self._getCache(n);
  return cache ? callback(cache) : aDb.createReadStream()
    .on('data', function (d) {
      var arr_map = arr.map(function (a) {
        return a.balanceSat;
      });
      var min = Math.min.apply(null, arr_map);
      var len = arr.length;
      var balanceSat = d.value.balanceSat;
      if (balanceSat >= min)
        if (len < n)
          arr.push(d.value);
        else
          arr[arr_map.indexOf(min)] = d.value;
    })
    .on('end', function () {
      // cache result
      self._cache = arr.sort(function (a, b) { 
        return b.balanceSat - a.balanceSat; 
      }));
      // to stdout
      self._cache.forEach(function (e) {
        console.log(e.addrStr, ':', e.balanceSat, '(satoshis)');
      });
      callback(self._cache);
    });
};
