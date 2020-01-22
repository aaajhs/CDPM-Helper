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

function alertMaintenance (targetTime){
  const mStartMinusTwo = targetTime.getTime() - (2 * 60 * 1000) - Date.now();
  const mStartMinusOne = targetTime.getTime() - (1 * 60 * 1000) - Date.now();
  const mStart = targetTime.getTime() - Date.now();

  setTimeout(function () {
    sendMessageTo('general', '서버 점검 2분 전');
  }, mStartMinusTwo);

  setTimeout(function () {
    sendMessageTo('general', '서버 점검 1분 전');
  } , mStartMinusOne);

  setTimeout(function () {
    sendMessageTo('general', '서버 점검 시작');
  }, mStart);

  // setTimeout(() => {
  //   console.log('this function called after 2 sec');
  // }, 2000);
}

//Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00
  console.log(mStartTime);
  res.send("OK, maintenance start time has been set.");
  alertMaintenance(mStartTime);
});

app.post("/setmend", (req, res) => {
  var mEndTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  console.log(mEndTime);
  res.send("OK, maintenance end time has been set.");
  alertMaintenance(mEndTime);
});

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
