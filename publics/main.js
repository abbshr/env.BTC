
var xhr = net.ajax('/localhost:3001/api/block', {
  method: 'GET',
  data: null,
  responseType: 'json'
}, function (res) {
  drawChart(ctx, 'Line', transfer(JSON.parse(res)));
});
