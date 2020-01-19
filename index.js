const SlackBot = require('slackbots');
const axios = require('axios');
const express = require('express');
const scheduler = require('node-schedule');
const bodyParser = require("body-parser");
const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

const bot = new SlackBot({
  token: 'xoxb-734466708384-874779367121-t9Z1pLq148prjBEDGpnVpS72',
  name: 'summer'
});

var path_to_call = 'https://slack.com/api/chat.postMessage?token=xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e&channel=general&text=%EC%84%9C%EB%B2%84%20%EC%A0%90%EA%B2%80%20%EC%8B%9C%EC%9E%91%2030%EB%B6%84%20%EC%A0%84&pretty=1';

//Start Handler
bot.on('start', function(){
  const params = {
    icon_emoji: ':alarm_clock:'
  }

  bot.postMessageToChannel('testing-slack-bots', '안녕하세요', params);

  request(path_to_call, function(error, response, body){
    if(!error && response.statusCode == 200){
      console.log('Success');
    } else{
      console.log(error);
    }
  });
});

//Error Handler
bot.on('error', (err) => console.log(err));

//bot Message Handler
// bot.on('message', (data) => {
//   if(data.type !== 'message') {
//     return;
//   }
//
//   if(!data.text.includes('@URQNXAT3K')){
//     return;
//   }
//
//   console.log(data);
//   //handleMessage(data.text);
// });

//Respond to message
// function handleMessage(message) {
//   if(message.includes('점검')){
//
//   }
// }

function sleep (delay) {
   var start = new Date().getTime();
   while (new Date().getTime() < start + delay);
}

//Command Handler
app.post("/setmstart", function(req, res) {
  res.send(200);
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00
  var timeDifference = mStartTime.getTime() - Date.now();

  // while(Date.now() <= mStartTime.getTime()){
  //   switch (timeDifference) {
  //     case (600000):
  //       //console.log(mStartTime.getTime() - Date.now());
  //       bot.postMessageToChannel('testing-slack-bots', "10 minutes before Live Server Maintenance");
  //       break;
  //     case (1800000):
  //       //console.log("30 minutes before");
  //       bot.postMessageToChannel('testing-slack-bots', "라이브 서버 점검 30분 전");
  //       break;
  //     case (0):
  //       bot.postMessageToChannel('testing-slack-bots', "라이브 서버 점검 시작");
  //       console.log(mStartTime.getTime() - Date.now());
  //       break;
  //     default:
  //       break;
  //   }
  // }
});


app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
