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

function sendMessageTo(channel, text) {
  slack.chat.postMessage({
    token: process.env.token,
    channel,
    text,
  }).catch(err => console.log(err))
}

function alertEvent(targetTime, eventType) {
  var mTimeMinusSixty = targetTime.getTime() - (60 * 60 * 1000) - Date.now();
  var mTimeMinusThirty = targetTime.getTime() - (30 * 60 * 1000) - Date.now();
  var mTimeMinusTen = targetTime.getTime() - (10 * 60 * 1000) - Date.now();
  var mTime = targetTime.getTime() - Date.now();
  var mTimeAll = [mTimeMinusSixty, mTimeMinusThirty, mTimeMinusTen, mTime];

  console.log(mTimeMinusTen);

  var keyString = ""; //alert message initialization
  switch (eventType) {
    case "mStart":
      keyString = "서버 점검 시작";
      break;
    case "mEnd":
      keyString = "서버 점검 종료";
      break;
    case "ptsStart":
      keyString = "PTS 시작";
      break;
    default:
      console.log("Invalid eventType");
  }

  setTimeout(function() {
    sendMessageTo(targetChannel, keyString + " 20분 전");
    console.log(mTimeMinusThirty)
  }, mTimeMinusThirty);

  setTimeout(function() {
    sendMessageTo(targetChannel, keyString + " 5분 전");
    console.log("Posted Message: " + keyString + " 5분 전")
  }, mTimeMinusTen);

  setTimeout(function() {
    sendMessageTo(targetChannel, keyString);
    console.log("Posted Message: " + keyString)
  }, mTime);

  // mTimeAll.forEach(function(item){
  //   setTimeout(function(){
  //     console.log(item);
  //     sendMessageTo(targetChannel, keyString + " " + item + " 분전");
  //   }, item);
  // });

  //sendMessage(targetChannel, keyString, mTimeAll);

  // setTimeout(() => {
  //   console.log('this function called after 2 sec');
  // }, 2000);
}

// function sendMessage(channel, key, timeSet) {
//   timeSet.forEach(function(item, index, array) {
//     setTimeout(function() {
//       console.log(item);
//       sendMessageTo(channel, key + " " + (item / 60 * 1000) + "분 전");
//       console.log("Posted Message: " + key + " " + (item / 60 * 1000) + "분 전");
//     }, item);
//   });
// };

// START BLOCK: Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, maintenance start time has been set.");
  alertEvent(mStartTime, "mStart");
});

app.post("/setmend", (req, res) => {
  var mEndTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, maintenance end time has been set.");
  alertEvent(mEndTime, "mEnd");
});

app.post("/setpts", (req, res) => {
  var ptsTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, PTS start time has been set.");
  alertEvent(ptsTime, "ptsStart");
});
// END BLOCK: Command Handler

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
