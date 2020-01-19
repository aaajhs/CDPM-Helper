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

function alertMaintenance (mStart){
  //while(Date.now() <= mStart.getTime()){
    //console.log(mStart.getTime() - Date.now());
    switch (mStart.getTime() - Date.now()) {
      case (120000):
        //console.log("30 minutes before");
        slack.chat.postMessage({
          token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
          channel: 'testing-slack-bots',
          text: '서버 점검 2분 전'});
        break;
      case (60000):
        //console.log(mStartTime.getTime() - Date.now());
        slack.chat.postMessage({
          token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
          channel: 'testing-slack-bots',
          text: '서버 점검 1분 전'});
        break;
      case (0):
        slack.chat.postMessage({
          token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
          channel: 'testing-slack-bots',
          text: '서버 점검 시작'});
          console.log(mStart.getTime() - Date.now());
          break;
      default:
        break;
    }
  //}

  // if(mStart.getTime() - Date.now() == 120000){
  //   slack.chat.postMessage({
  //     token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
  //     channel: 'testing-slack-bots',
  //     text: '서버 점검 2분 전'});
  // }
  // else if(mStart.getTime() - Date.now() == 60000){
  //   slack.chat.postMessage({
  //     token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
  //     channel: 'testing-slack-bots',
  //     text: '서버 점검 1분 전'});
  // }
  // else if(mStart.getTime() - Date.now() == 0){
  //   slack.chat.postMessage({
  //     token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
  //     channel: 'testing-slack-bots',
  //     text: '서버 점검 시작'});
  // }

}

//Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00
  console.log(mStartTime);
  res.send(200);
  while(Date.now() <= mStartTime.getTime()){
    alertMaintenance(mStartTime);
  }
});


app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
