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

function sendMessageTo(channel, text) {
  slack.chat.postMessage({
    token: process.env.token,
    channel,
    text,
  });
}

function alertMaintenance (targetTime, startEnd){
  const mTimeMinusTwenty = targetTime.getTime() - (20 * 60 * 1000) - Date.now();
  const mTimeMinusFive = targetTime.getTime() - (5 * 60 * 1000) - Date.now();
  const mTime = targetTime.getTime() - Date.now();

  setTimeout(function () {
    if(startEnd.localeCompare("start") == 0){
      sendMessageTo('bot-testspace', '서버 점검 시작 20분 전');
    }
    else if(startEnd.localeCompare("end") == 0){
      sendMessageTo('bot-testspace', '서버 점검 종료 20분 전');
    }
  }, mTimeMinusTwenty);

  setTimeout(function () {
    if(startEnd.localeCompare("start") == 0){
      sendMessageTo('bot-testspace', '서버 점검 시작 5분 전');
    }
    else if(startEnd.localeCompare("end") == 0){
      sendMessageTo('bot-testspace', '서버 점검 종료 5분 전')
    }
  } , mTimeMinusFive);

  setTimeout(function () {
    if(startEnd.localeCompare("start") == 0){
      sendMessageTo('bot-testspace', '서버 점검 시작');
    }
    else if(startEnd.localeCompare("end") == 0){
      sendMessageTo('bot-testspace', '서버 점검 종료');
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
  res.send("서버 점검 시작시간이 설정되었습니다.");
  alertMaintenance(mStartTime, mTimeType);
});

app.post("/setmend", (req, res) => {
  var mEndTime = new Date(req.body.text); //format: 2011-10-10T14:48:00
  var mTimeType = "end";
  res.send("서버 점검 종료시간이 설정되었습니다.");
  alertMaintenance(mEndTime, mTimeType);
});

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
