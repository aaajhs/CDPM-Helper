module.exports = {
    format_time,
};

function format_time(date, time){
    console.log("log 3: " + date);
    var split_date = date.split('-');
    var split_time = time.split(':');
    var newdate = new Date(split_date[0], split_date[1], split_date[2], split_time[0], split_time[1]);
    console.log(newdate);
    return newdate;
}