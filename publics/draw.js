
function drawChart(ctx, chartType, data) {
  new Chart(ctx)[chartType](data);
}

function transfer(rawdata) {
  var data = {
    labels: [],
    datasets: []
  };
  for (var i in rawdata.blocks)
    data.
  return data;
}