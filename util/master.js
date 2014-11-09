#!/usr/bin/env node
var cluster = require('cluster');
var curhash = [{hash: '14', id: null}, {hash: '2', id: null}, {hash: '3', id: null}];
if (cluster.isMaster) {
	cluster.on('online', function (worker) {
		console.log('worker', worker.id, 'online');
	})
	.on('disconnect', function (worker) {})
	.on('exit', function (worker, code, signal) {
		var id = worker.id;
		curhash.some(function (e) {
			if (e.id == id) {
				worker = cluster.fork();
				worker.on('message', function (msg) {
					if (msg == 'done') {
						worker.disconnect();
						process.exit();
					} else
						e.hash = msg;
				});
				worker.send(e.hash);
				e.id = worker.id;
				return true;
			}
		});
	});

	curhash.forEach(function (e) {
		var worker = cluster.fork();
		e.id = worker.id;
		worker.on('message', function (msg) {
			if (msg == 'done') {
				worker.disconnect();
				process.exit();
			} else
				e.hash = msg;
		});
		worker.send(e.hash);
	});
} else {
	var addressDb = require('../lib/AddressDb');
	addressDb.historicSync(cluster);
}