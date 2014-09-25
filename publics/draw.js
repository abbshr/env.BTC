
function drawChart(ctx, chartType, data) {
  new Chart(ctx)[chartType](data);
}

function transfer(blocks) {
  var std_date;
  var data = {
    labels: [],
    datasets: [{
      fillColor : "rgba(220,220,220,0.5)",
      strokeColor : "rgba(220,220,220,1)",
      pointColor : "rgba(220,220,220,1)",
      pointStrokeColor : "#fff",
      data : []
    },
    {
      fillColor : "rgba(151,187,205,0.5)",
      strokeColor : "rgba(151,187,205,1)",
      pointColor : "rgba(151,187,205,1)",
      pointStrokeColor : "#fff",
      data : []
    }]
  };
  
  blocks.reverse();
  data.datasets[0].data = blocks.reduce(function (d, b) {
    var ts = +b.time;
    var reward = util.getReward(b.height);
    var date = new Date(ts * 1000).toDateString();

    if (!d.length || date != std_date){
      std_date = date;
      data.labels.push(date);
      return d.concat((d[d.length - 1] || 0) + reward);
    }
    d[d.length - 1] += reward;
    return d;
  }, []);

  data.datasets[0].data.reduce(function (d, b) {
    data.datasets[1].data.push(b - d);
    return b;
  }, 0);
  
  return data;
}