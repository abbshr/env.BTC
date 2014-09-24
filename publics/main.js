
var xhr = net.ajax(
  'http://172.16.0.70:3000/api/blocks',
  {
    data: 'blockDate=' + start + '&'
  }
  , function (res) {
  drawChart(ctx, 'Line', transfer(JSON.parse(res)));
});
