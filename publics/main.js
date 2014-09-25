
var start = start_time.valueAsNumber;
var end = end_time.valueAsNumber;

if (start <= end)
  // total BTC in a peirod
  var xhr = net.ajax(
    'http://172.16.0.70:3000/api/blocks',
    {
      data: 'blockDate=' + start_time.value + '&startTimestamp=' + end / 1000
    }
    , function (err, res) {
    drawChart(ctx, 'Line', transfer(res.blocks));
  });
