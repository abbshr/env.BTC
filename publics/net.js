
var net = {};
net.ajax = function (url, options, callback) {
  if (!url) 
    throw new Error('Bad URL');
  if (typeof options == 'function')
    callback = options;

  var method = options.method || 'GET';
  var data = options.data || null;
  var headers = options.headers || {};

  var _req = new XMLHttpRequest();

  Object.keys(headers).forEach(function (key) {
    _req.setRequestHeader(key, headers[key]);
  });
  _req.responseType = options.responseType || 'json';

  _req.open(method, url, true, options.user, options.password);
  _req.onreadystatechange = function (e) {
    if (this.readyState === this.DONE)
      return callback(null, this.response);
  };
  _req.onerror = function (e) {
    return callback(err, null);
  };
  _req.send(data);

  return _req;
};
