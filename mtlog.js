const config = require('./config');

function getWeekNumber(targetDate) {
  targetDate.setUTCDate(targetDate.getUTCDate() + 4 - (targetDate.getUTCDay() || 7)); //set targetDate to nearest Thursday & change weekday 0 to 7
  var yearStart = new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((targetDate - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

module.exports.getWeekNumber = getWeekNumber;
