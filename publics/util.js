
var util = {};

util.getReward = function (height) {
  return 50 >> (height / 210000);
};
