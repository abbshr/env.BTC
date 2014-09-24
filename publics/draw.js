
function drawChart(ctx, chartType, data) {
  new Chart(ctx)[chartType](data);
}

function transfer(rawdata) {
  var data = {
    labels: [],
    datasets: [{
      fillColor : "rgba(151,187,205,0.5)",
      strokeColor : "rgba(151,187,205,1)",
      pointColor : "rgba(151,187,205,1)",
      pointStrokeColor : "#fff",
      data : []
    }]
  };
  data.datasets[0].data = rawdata.blocks.reduce(function (d, b, i, blocks) {
    var second = b.time;
    var reward = util.getReward(b.height);
    var dlen = d.length;
    var blen = blocks.length;
    var r, rs, totalReward, newReward, rewardIndex;

    if (!dlen) {
      d.push({
        r: [[0, reward]],
        t: second
      });
      return d;
    }

    if (second - d[dlen - 1].t > 86400) {
      r = d.pop().r;
      rs = r[r.length - 1];
      rs[0] = i - rs[0];
      totalReward = r.reduce(function (a, e, i) {
        return a + e[0] * e[1];
      }, 0);
      d.push(totalReward);
      if (blen - 1 != i)
        d.push({
          r: [[i, reward]],
          t: second
        });
      else
        d.push(reward);
      return d;
    } else {
      if (blen - 1 == i) {
        r = d.pop().r;
        rs = r[r.length - 1];
        rs[0] = i - rs[0] + 1;
        totalReward = r.reduce(function (a, e, i) {
          return a + e[0] * e[1];
        }, 0);
        d.push(totalReward);
        return d;
      }
    }

    if (reward != d[dlen - 1].r[d[dlen - 1].r.length - 1][1]) {
      rs = d[dlen - 1].r[d[dlen - 1].r.length - 1];
      rs[0] = i - rs[0];
      d[dlen - 1].r.push([i, reward]);
      return d;
    }

    return d;
  }, []);

  return data;
}