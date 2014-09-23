
var Ajax = function (url, options, callback) {
  if (!url) 
    throw new Error('Bad URL');
  if (typeof options == 'function')
    callback = options;

  var method = options.method || 'GET';
  var data = options.data || null;

  var _req = new XMLHttpRequest();

  if (options.header)
    _req.setHeaders();
  if (options.overrideMimeType)
    _req.methodOverride();
  if (options.responseType)
    _req.responseType = options.responseType;

  _req.open(url, method);
  _req.onreadystatechange = function (e) {
    if (this.readyState === this.DONE)
      return callback(null, this.response);
  };
  _req.onerror = function (e) {
    return callback(err, null);
  };

};

var ajax = new Ajax('/localhost:3001/', {

}, function (err, res) {
  draw(res);
});
