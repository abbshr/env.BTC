/* 启动前注意package中的start脚本配置, 字段请手动修改 */

'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var rootPath = path.normalize(__dirname + '/..'),
  env,
  db,
  port,
  b_port,
  p2p_port;

var packageStr = fs.readFileSync(rootPath + '/package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

// levelDB存储目录, 默认设置为根目录上级的insight-db/
var home = process.env.INSIGHT_DB || path.join(rootPath, '../insight-db');

// 真实网络环境下需要添加环境变量INSIGHT_NETWORK=livenet
if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '3000';
  b_port = '8332';
  p2p_port = '8333';
} else {
  env = 'testnet';
  db = home + '/testnet';
  port = '3001';
  b_port = '18332';
  p2p_port = '18333';
}
port = parseInt(process.env.INSIGHT_PORT) || port;


switch (process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'testnet';

// 设置bitcoind的raw数据存储目录, 默认(testnet)为用根目录下的test/bitcoin_testnet
// 70, livenet : 'external_2/btc/rawblock'
var dataDir = process.env.BITCOIND_DATADIR || path.join(process.env.HOME, 'test/bitcoin_testnet/');
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\Bitcoin\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/Bitcoin/';
  if (isLinux) dataDir = process.env.HOME + '/.bitcoin/';
}
dataDir += network === 'testnet' ? 'testnet3' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache = process.env.INSIGHT_IGNORE_CACHE || 0;


var bitcoindConf = {
  protocol: process.env.BITCOIND_PROTO || 'http',
  user: process.env.BITCOIND_USER || 'bitcoinrpc', // rpc用户名
  pass: process.env.BITCOIND_PASS || '2nunWt8559WrT9VkwvvJD16w8gGTbKYDBRKx6irRRVVe', // rpc口令
  host: process.env.BITCOIND_HOST || '127.0.0.1',
  port: process.env.BITCOIND_PORT || b_port,
  p2pPort: process.env.BITCOIND_P2P_PORT || p2p_port,
  p2pHost: process.env.BITCOIND_P2P_HOST || process.env.BITCOIND_HOST || '127.0.0.1',
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

var enableMonitor = process.env.ENABLE_MONITOR === 'true';
var enableCleaner = process.env.ENABLE_CLEANER === 'true';
var enableMailbox = process.env.ENABLE_MAILBOX === 'true';
var enableRatelimiter = process.env.ENABLE_RATELIMITER === 'true';
var enableCredentialstore = process.env.ENABLE_CREDSTORE === 'true';
var enableEmailstore = process.env.ENABLE_EMAILSTORE === 'true';
var enablePublicInfo = process.env.ENABLE_PUBLICINFO === 'true';
var loggerLevel = process.env.LOGGER_LEVEL || 'info';
var enableHTTPS = process.env.ENABLE_HTTPS === 'true';

if (!fs.existsSync(db)) {
  mkdirp.sync(db);
}

module.exports = {
  enableMonitor: enableMonitor,
  monitor: require('../plugins/config-monitor.js'),
  enableCleaner: enableCleaner,
  cleaner: require('../plugins/config-cleaner.js'),
  enableMailbox: enableMailbox,
  mailbox: require('../plugins/config-mailbox.js'),
  enableRatelimiter: enableRatelimiter,
  ratelimiter: require('../plugins/config-ratelimiter.js'),
  enableCredentialstore: enableCredentialstore,
  credentialstore: require('../plugins/config-credentialstore'),
  enableEmailstore: enableEmailstore,
  emailstore: require('../plugins/config-emailstore'),
  enablePublicInfo: enablePublicInfo,
  publicInfo: require('../plugins/publicInfo/config'),
  loggerLevel: loggerLevel,
  enableHTTPS: enableHTTPS,
  version: version,
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Bitcoin Network Analytics ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  bitcoind: bitcoindConf,
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
};
