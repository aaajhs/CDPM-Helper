const SlackBot = require('slackbots');
const axios = require('axios');
const express = require('express');
const scheduler = require('node-schedule');
const bodyParser = require("body-parser");
const slack = require("slack");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

function sendMessageTo(channel, text) {
  slack.chat.postMessage({
    token: process.env.token,
    channel,
    text,
  });
}

function alertMaintenance (targetTime, startEnd){
  const mTimeMinusTwo = targetTime.getTime() - (2 * 60 * 1000) - Date.now();
  const mTimeMinusOne = targetTime.getTime() - (1 * 60 * 1000) - Date.now();
  const mTime = targetTime.getTime() - Date.now();

  setTimeout(function () {
    if(startEnd.localeCompare("start") == 0){
      sendMessageTo('general', 'teststring');
    }
    else if(startEnd.localeCompare("end") == 0){
      sendMessageTo('general', '서버 점검 종료 2분 전');
    }
  }, mTimeMinusTwo);

  setTimeout(function () {
    if(startEnd.localeCompare("start") == 0){
      sendMessageTo('general', '서버 점검 1분 전');
    }
    else if(startEnd.localeCompare("end") == 0){
      sendMessageTo('general', '서버 점검 종료 1분 전')
    }
  } , mTimeMinusOne);

  setTimeout(function () {
    if(startEnd.localeCompare("start") == 0){
      sendMessageTo('general', '서버 점검 시작');
    }
    else if(startEnd.localeCompare("end") == 0){
      sendMessageTo('general', '서버 점검 종료');
    }

  }, mTime);

  // setTimeout(() => {
  //   console.log('this function called after 2 sec');
  // }, 2000);
}

//Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00
  var mTimeType = "start";
  res.send("OK, maintenance start time has been set.");
  alertMaintenance(mStartTime, mTimeType);
});

app.post("/setmend", (req, res) => {
  var mEndTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  var mTimeType = "end";
  res.send("OK, maintenance end time has been set.");
  alertMaintenance(mEndTime, mTimeType);
});

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
