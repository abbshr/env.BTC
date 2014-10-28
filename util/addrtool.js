#!/usr/bin/env node
var addressDb = require('../lib/AddressDb');

var fs = require('fs');

addressDb.historicSync();
/*addressDb.getTopNAddress(100, function (addrs) {
  addrs.forEach(function (addr) {
    fs.appendFileSync('./top100', addr.addrStr + '\n');
  });
});*/