const express = require('express');
const bodyParser = require("body-parser");
const slack = require("slack");

// START BLOCK: Keep heroku alive
var http = require("http");
setInterval(function() {
  http.get("http://frozen-wave-50664.herokuapp.com");
  console.log("Stay alive! " + Date.now());
}, 1200000);
// END BLOCK: heroku alive

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

var targetChannel = 'bot-testspace';

// function sendMessageTo(channel, text) {
//   slack.chat.postMessage({
//     token: process.env.token,
//     channel,
//     text,
//     link_names: 1
//   }).catch(err => console.log(err))
// }
//
// function alertEvent(targetTime, eventType) {
//   var mTimeMinusThirty = targetTime.getTime() - (30 * 60 * 1000) - Date.now();
//   var mTimeMinusTen = targetTime.getTime() - (10 * 60 * 1000) - Date.now();
//   var mTime = targetTime.getTime() - Date.now();
//   var mTimeAll = [mTimeMinusThirty, mTimeMinusTen, mTime];
//   var timeBefore = [" 30분 전", " 10분 전", ""];
//
//   var keyString = "*_Reminder:_* ";
//   switch (eventType) {
//     case "mStart":
//       keyString += "서버 점검 시작";
//       break;
//     case "mEnd":
//       keyString += "서버 점검 종료";
//       break;
//     case "ptsStart":
//       keyString += "PTS 시작";
//       break;
//     default:
//       console.log("Invalid eventType");
//   }
//
//   mTimeAll.forEach(function(item, index) {
//     setTimeout(function() {
//       var msg = keyString + timeBefore[index];
//       console.log(keyString.localeCompare("서버 점검 시작"));
//       if (timeBefore[index].localeCompare("") == 0) {
//         msg += " @devops_emergency";
//       } else if (timeBefore[index].localeCompare("") == 0 && keyString.localeCompare("서버 점검 종료") == 0) {
//         msg += ". PTS 종료.";
//       }
//       // if(msg.localeCompare("서버 점검 시작")){
//       //   msg = msg + " @aaajhs";
//       // }
//       // else if(msg.localeCompare("서버 점검 종료")){
//       //   msg += ". PTS 종료";
//       // }
//
//       sendMessageTo(targetChannel, msg);
//       console.log("Posted Message: " + msg);
//     }, item);
//   });
//
//   // setTimeout(() => {
//   //   console.log('this function called after 2 sec');
//   // }, 2000);
// }







// function for sending message with a delay
function sendTimedMessage(channel, text, time) {
  setTimeout(function() {
    slack.chat.postMessage({
      token: process.env.token,
      channel,
      text,
      link_names: 1
    }).catch(err => console.log(err))
  }, time);
};
// end

// function for maintenance reminder routine
function mRoutine(targetChannel, startTime, endTime, updateDate){ // startTime, endTime is in 2020-03-12T12:00:00 format
  mReminder(targetChannel, true, startTime, updateDate);
  mReminder(targetChannel, false, endTime, updateDate);
}
// end

// function for maintenance reminders
function mReminder(channel, isStartTime, time, updateDate){ //time is in 2020-03-21T12:44:44 format
  var tThirty = time.getTime() - (30 * 60 * 1000) - Date.now();
  var tTen = time.getTime() - (10 * 60 * 1000) - Date.now();
  var tTime = time.getTime() - Date.now();

  if(isStartTime == true){ //this is a reminder for maintenance start
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 10분 전", tTen);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 @devops_emergency", tTime);
    sendTimedMessage(targetChannel, updateDate + "점검 스레드 @cd_production @console_qa", tTime);
  }
  else if(isStartTime == false){ //this is a reminder for maintenance end
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 10분 전", tTen);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료", tTime);
  }
}
// end

// function to handle parameters
function parameters(input){
  var updateType = input.substring(0,1);
  var year = input.substring(2,4);
  var month = input.substring(4,6);
  var day = input.substring(6,8);
  var startHour = input.substring(9,11);
  var startMinute = input.substring(11,13);
  var endHour = input.substring(14,16);
  var endMinute = input.substring(16,18);

  var start = "20" + year + "-" + month + "-" + day + "T" + startHour + ":" + startMinute + ":00";
  var end = "20" + year + "-" + month + "-" + day + "T" + endHour + ":" + endMinute + ":00";
  var date = month + "/" + day;

  return [updateType, start, end, date];
}

// START BLOCK: Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, maintenance start time has been set.");
  console.log(req.body.text);
  alertEvent(mStartTime, "mStart");
});

app.post("/setmend", (req, res) => {
  var mEndTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, maintenance end time has been set.");
  console.log(req.body.text);
  alertEvent(mEndTime, "mEnd");
});

app.post("/setpts", (req, res) => {
  var ptsTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, PTS start time has been set.");
  console.log(req.body.text);
  alertEvent(ptsTime, "ptsStart");
});


app.post("/consoleupdate", (req, res) => {
  //parameter Handler
  var updateType = parameters(req.body.text)[0];
  var startTime = new Date(parameters(req.body.text)[1]);
  var endTime = new Date(parameters(req.body.text)[2]);
  var updateDate = parameters(req.body.text)[3];

  res.send("OK, Update has been registered.");

  switch (updateType) {
    case 'c':
      mRoutine(targetChannel, startTime, endTime, updateDate);
      sendTimedMessage(targetChannel, updateDate + " 라이브 서버 오픈", endTime.getTime() - Date.now());
      sendTimedMessage(targetChannel, "*_Reminder:_* PTS Close", endTime.getTime() - Date.now());
      break;
    case 'h':
      mRoutine(targetChannel, startTime, endTime, updateDate);
      sendTimedMessage(targetChannel, updateDate + " 라이브 서버 오픈", endTime.getTime() - Date.now());
      break;
    case 'n':
      sendTimedMessage(targetChannel, "라이브 서버 오픈 30분 전", endTime.getTime() - Date.now());
      sendTimedMessage(targetChannel, "라이브 서버 오픈 10분 전", endTime.getTime() - Date.now());
      sendTimedMessage(targetChannel, updateDate + "라이브 서버 오픈", endTime.getTime() - Date.now());
      break;
    //case 'p': for pts
    default:
      console.log("Invalid updateType");
  }
});
// END BLOCK: Command Handler

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
