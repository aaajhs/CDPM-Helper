module.exports = {
    format_time,
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