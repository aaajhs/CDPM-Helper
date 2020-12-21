module.exports = {
    format_time,
    get_week_number,
};

function format_time(date, time){
    try{
        var split_date = date.split('-');
        var split_time = time.split(':');
        return new Date(split_date[0], split_date[1] - 1, split_date[2], split_time[0], split_time[1]);
    }
    catch(err){
        console.log("[App] Error formatting time: " + err);
    }
}

function get_week_number(date) {
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); //set targetDate to nearest Thursday & change weekday 0 to 7
    var year_start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    var week_number = Math.ceil((((date - year_start) / 86400000) + 1) / 7);
    return week_number;
  }