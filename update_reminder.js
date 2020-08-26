const config = require('./config');

// function for sending message with a delay
function sendTimedMessage(channel, text, time) {
  setTimeout(function() {
    config.web.chat.postMessage({
      token: process.env.token,
      channel,
      text,
      link_names: 1
    }).catch(err => console.log(err))
  }, time);
};

// function for maintenance reminders
function mReminder(channel, isStartTime, time, updateDate) { //time is in 2020-03-21T12:44:44 format
  var tThirty = time.getTime() - (30 * 60 * 1000) - Date.now();
  var tTen = time.getTime() - (10 * 60 * 1000) - Date.now();
  var tTime = time.getTime() - Date.now();

  if (isStartTime == true) { //this is a reminder for maintenance start
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 10분 전", tTen);
    sendTimedMessage(config.targetChannel, "*_Thread:_* `" + updateDate + " 점검 스레드`", tTime);
  } else if (isStartTime == false) { //this is a reminder for maintenance end
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 10분 전", tTen);
  }
}

// function to handle parameters
function parameters(date, start, end) {

  var start = date + "T" + start.substring(0, 2) + ":" + start.substring(2, 4) + ":00";
  var end = date + "T" + end.substring(0, 2) + ":" + end.substring(2, 4) + ":00";

  return [start, end];
}

// function to alert updates
function alertUpdate(updateType, startTime, endTime, updateDate) {
  if (new Date(startTime.getTime() - (30 * 60 * 1000)) > new Date() && new Date(endTime.getTime() - (30 * 60 * 1000)) > new Date() && new Date(startTime.getTime() - (30 * 60 * 1000)) < new Date(new Date().getTime() + (5 * 60 * 1000))) { //if it's more than 30 minutes before maintenance has started AND five minutes later it'll be less than 30 minutes before maintenance starts
    console.log("[Alert Update] Reminders will be executed for startTime and endTime.");
    switch (updateType) {
      case 'f':
        mReminder(config.targetChannel, true, startTime, updateDate);
        sendTimedMessage(config.targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
        break;
      case 'l':
        mReminder(config.targetChannel, true, startTime, updateDate);
        break;
      case 'm':
        sendTimedMessage(config.targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
        sendTimedMessage(config.targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
        sendTimedMessage(config.targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작", endTime.getTime() - Date.now());
        break;
        //case 'p': for pts
      default:
        console.log("[Alert Update] Invalid updateType");
    }
  } else if (startTime < new Date() && new Date(endTime.getTime() - (30 * 60 * 1000)) > new Date() && new Date(endTime.getTime() - (30 * 60 * 1000)) < new Date(new Date().getTime() + (5 * 60 * 1000))) { //if it's after maintenance has started, but more than 30 minutes before ended AND five minutes later it'll be less than 30 minutes before maintenance ends
    console.log("[Alert Update] It is already past the startTime, executing reminders for endTime only.");
    switch (updateType) {
      case 'f':
        mReminder(config.targetChannel, false, endTime, updateDate);
        sendTimedMessage(config.targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
        break;
      case 'l':
        mReminder(config.targetChannel, false, endTime, updateDate);
        break;
      case 'm':
        sendTimedMessage(config.targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
        sendTimedMessage(config.targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
        sendTimedMessage(config.targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작", endTime.getTime() - Date.now());
        break;
        //case 'p': for pts
      default:
        console.log("[Alert Update] Invalid updateType");
    }
  } else {
    console.log("[Alert Update] It is more than five minutes before maintenance start/end, or it is already past the endTime. Reminder request will be ignored.");
  }
}

module.exports.sendTimedMessage = sendTimedMessage;
module.exports.mReminder = mReminder;
module.exports.parameters = parameters;
module.exports.alertUpdate = alertUpdate;
