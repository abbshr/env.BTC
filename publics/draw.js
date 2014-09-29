
function drawChart(ctx, chartType, data) {
  new Chart(ctx)[chartType](data);
}

/* compute the total btcs in a certain period */
function total_counts(blocks) {
  var std_date;
  var data = {
    labels: [],
    datasets: [
    // total counts in this period
    {
      fillColor : "rgba(220,220,220,0.5)",
      strokeColor : "rgba(220,220,220,1)",
      pointColor : "rgba(220,220,220,1)",
      pointStrokeColor : "#fff",
      data : []
    },
    // every day's production
    {
      fillColor : "rgba(151,187,205,0.5)",
      strokeColor : "rgba(151,187,205,1)",
      pointColor : "rgba(151,187,205,1)",
      pointStrokeColor : "#fff",
      data : []
    }]
  };
  var reward_arr = data.datasets[1].data;

  blocks.reverse();
  data.datasets[0].data = blocks.reduce(function (d, b) {
    var ts = +b.time;
    var reward = util.getReward(b.height);
    var date = new Date(ts * 1000).toDateString();

    if (!d.length || date != std_date) {
      std_date = date;
      data.labels.push(date);
      data.datasets[1].data.push(reward);
      return d.concat((d[d.length - 1] || 0) + reward);
    }

    reward_arr[reward_arr.length - 1] += reward;
    d[d.length - 1] += reward;
    
    return d;
  }, []);
  
  return data;
}

/* statistic the info of the most wealthy accounts */
function top_accounts(addresses) {}
