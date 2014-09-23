
var net = {};
net.ajax = function (url, options, callback) {
  if (!url) 
    throw new Error('Bad URL');
  if (typeof options == 'function')
    callback = options;

  var method = options.method || 'GET';
  var data = options.data || null;

  var _req = new XMLHttpRequest();

  if (options.header && Object.keys(options.header).length)
    for (var i in options.header)
      _req.setRequestHeader(i, options.header[i]);
  if (options.mimeType)
    _req.overrideMimeType(options.mimeType);
  if (options.responseType)
    _req.responseType = options.responseType;

  _req.open(url, method, true, options.user, options.password);
  _req.onreadystatechange = function (e) {
    if (this.readyState === this.DONE)
      return callback(null, this.response);
  };
  _req.onerror = function (e) {
    return callback(err, null);
  };

  return _req;
};
