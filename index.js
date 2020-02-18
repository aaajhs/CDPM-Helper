const express = require('express');
const bodyParser = require("body-parser");
const slack = require("slack");

// Keep heroku alive
var http = require("http");
setInterval(function(){
  http.get("http://frozen-wave-50664.herokuapp.com");
  console.log("Stay alive! " + Date.now());
}, 1200000);
// End heroku alive

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

function alertMaintenance (targetTime, eventType){
  const mTimeMinusTwenty = targetTime.getTime() - (20 * 60 * 1000) - Date.now();
  const mTimeMinusFive = targetTime.getTime() - (5 * 60 * 1000) - Date.now();
  const mTime = targetTime.getTime() - Date.now();

  var keyString = "";

  switch (eventType){
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

  setTimeout(function () {
    sendMessageTo(targetChannel, keyString + " 20분 전");
  }, mTimeMinusTwenty);

  setTimeout(function () {
    sendMessageTo(targetChannel, keyString + " 5분 전");
  } , mTimeMinusFive);

  setTimeout(function () {
    sendMessageTo(targetChannel, keyString);
  }, mTime);

  // setTimeout(() => {
  //   console.log('this function called after 2 sec');
  // }, 2000);
}

//Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00
  res.send("OK, maintenance start time has been set.");
  alertMaintenance(mStartTime, "mStart");
});

app.post("/setmend", (req, res) => {
  var mEndTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, maintenance end time has been set.");
  alertMaintenance(mEndTime, "mEnd");
});

app.post("/setPTS", (req, res) => {
  var ptsTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  res.send("OK, PTS start time has been set.");
  alertMaintenance(ptsTime, "ptsStart");
});

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
