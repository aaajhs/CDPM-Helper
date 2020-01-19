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

// const bot = new SlackBot({
//   token: 'xoxb-734466708384-874779367121-t9Z1pLq148prjBEDGpnVpS72',
//   name: 'summer'
// });
//
// var path_to_call = 'https://slack.com/api/chat.postMessage?token=xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e&channel=general&text=%EC%84%9C%EB%B2%84%20%EC%A0%90%EA%B2%80%20%EC%8B%9C%EC%9E%91%2030%EB%B6%84%20%EC%A0%84&pretty=1';
// var entries = {
//   token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
//   channel: 'general',
//   text: 'Final Test'
// };
//
// //Start Handler
// bot.on('start', function(){
//   const params = {
//     icon_emoji: ':alarm_clock:'
//   }
//
//   bot.postMessageToChannel('testing-slack-bots', '안녕하세요', params);
//
//
//   // axios.get(path_to_call)
//   // .then((response) => {
//   //   return response;
//   // })
//   // .catch((error) => {
//   //   console.log(error);
//   // });
//
//   // axios.post('https://slack.com/api/chat.postMessage', entries)
//   // .then(function(response){
//   //   console.log(response);
//   // })
//   // .catch(function(error){
//   //   console.log(error);
//   // });
//
//   slack.chat.postMessage({
//     token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
//     channel: 'general',
//     text: 'Final Test'});
// });
//
// //Error Handler
// bot.on('error', (err) => console.log(err));

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

// function sleep (delay) {
//    var start = new Date().getTime();
//    while (new Date().getTime() < start + delay);
// }

function alertMaintenance (mStart){
  var timeDifference = mStartTime.getTime() - Date.now();
  console.log("Successfully entered alertMaintenance");
  while(Date.now() <= mStartTime.getTime()){
    switch (timeDifference) {
      case (60000):
        //console.log(mStartTime.getTime() - Date.now());
        slack.chat.postMessage({
          token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
          channel: 'testing-slack-bots',
          text: '서버 점검 1분 전'});
        break;
      case (180000):
        //console.log("30 minutes before");
        slack.chat.postMessage({
          token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
          channel: 'testing-slack-bots',
          text: '서버 점검 3분 전'});
        break;
      case (0):
      slack.chat.postMessage({
        token: 'xoxp-734466708384-734473058917-873557841859-3dd4345d6fb7271677b9cda17cd3541e',
        channel: 'testing-slack-bots',
        text: '서버 점검 시작'});
        console.log(mStartTime.getTime() - Date.now());
        break;
      default:
        break;
    }
  }
}

//Command Handler
app.post("/setmstart", function(req, res) {
  var mStartTime = new Date(req.body.text);  //format: 2011-10-10T14:48:00

  res.send(200);
  alertMaintenance(mStartTime);
});


app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
