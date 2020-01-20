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
    token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
    channel,
    text,
  });
}

function alertMaintenance (mStart){
  const delayUntilTwoMinuteBefore = mStart.getTime() - (2 * 60 * 1000) - Date.now();
  const delayUntilOneMinuteBefore = mStart.getTime() - (1 * 60 * 1000) - Date.now();
  const delayUntilMaintenance = mStart.getTime() - Date.now();

  setTimeout(function () {
    sendMessageTo('testing-slack-bots', '서버 점검 2분 전');
  }, delayUntilTwoMinuteBefore);

  setTimeout(function () {
    sendMessageTo('testing-slack-bots', '서버 점검 1분 전');
  } , delayUntilOneMinuteBefore);

  setTimeout(function () {
    sendMessageTo('testing-slack-bots', '서버 점검 시작');
  }, delayUntilMaintenance);

  // setTimeout(() => {
  //   console.log('this function called after 2 sec');
  // }, 2000);

}

//Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00
  console.log(mStartTime);
  res.send(200);
  alertMaintenance(mStartTime);
});


app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
