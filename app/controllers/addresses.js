'use strict';

/**
 * Module dependencies.
 */

var Address = require('../models/Address'),
  common = require('./common'),
  async = require('async');

var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var level = require('levelup');

var getAddr = function(req, res, next) {
  var a;
  try {
    var addr = req.param('addr');
    a = new Address(addr);
  } catch (e) {
    common.handleErrors({
      message: 'Invalid address:' + e.message,
      code: 1
    }, res, next);
    return null;
  }
  return a;
};

var getAddrs = function(req, res, next) {
  var as = [];
  try {
    var addrStrs = req.param('addrs');
    var s = addrStrs.split(',');
    if (s.length === 0) return as;
    for (var i = 0; i < s.length; i++) {
      var a = new Address(s[i]);
      as.push(a);
    }
  } catch (e) {
    common.handleErrors({
      message: 'Invalid address:' + e.message,
      code: 1
    }, res, next);
    return null;
  }
  return as;
};

exports.show = function(req, res, next) {
  var a = getAddr(req, res, next);

  if (a) {
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      } else {
        return res.jsonp(a.getObj());
      }
    }, {txLimit: req.query.noTxList?0:-1, ignoreCache: req.param('noCache')});
  }
};



exports.utxo = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a) {
    a.update(function(err) {
      if (err)
        return common.handleErrors(err, res);
      else {
        return res.jsonp(a.unspent);
      }
    }, {onlyUnspent:1, ignoreCache: req.param('noCache')});
  }
};

exports.multiutxo = function(req, res, next) {
  var as = getAddrs(req, res, next);
  if (as) {
    var utxos = [];
    async.each(as, function(a, callback) {
      a.update(function(err) {
        if (err) callback(err);
        utxos = utxos.concat(a.unspent);
        callback();
      }, {onlyUnspent:1, ignoreCache: req.param('noCache')});
    }, function(err) { // finished callback
      if (err) return common.handleErrors(err, res);
      res.jsonp(utxos);
    });
  }
};


exports.balance = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      } else {
        return res.jsonp(a.balanceSat);
      }
    }, {ignoreCache: req.param('noCache')});
};

exports.totalReceived = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      } else {
        return res.jsonp(a.totalReceivedSat);
      }
    }, {ignoreCache: req.param('noCache')});
};

exports.totalSent = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      } else {
        return res.jsonp(a.totalSentSat);
      }
    }, {ignoreCache: req.param('noCache')});
};

exports.unconfirmedBalance = function(req, res, next) {
  var a = getAddr(req, res, next);
  if (a)
    a.update(function(err) {
      if (err) {
        return common.handleErrors(err, res);
      } else {
        return res.jsonp(a.unconfirmedBalanceSat);
      }
    }, {ignoreCache: req.param('noCache')});
};

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
            $gt: "13rs5eYkRhGpPxv6u25zf9u2Aojgv2mESD"
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

exports.getTopNAddress = function (n, callback) {
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
};
