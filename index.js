const express = require('express');
const bodyParser = require("body-parser");
const slack = require("slack");
const admin = require('firebase-admin');

// START BLOCK: Keep heroku alive
var http = require("http");
setInterval(function() {
  http.get("http://frozen-wave-50664.herokuapp.com");
  console.log("Stay alive! " + Date.now());
}, 1200000);
// END BLOCK: Keep heroku alive

// START BLOCK: Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.type,
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key.replace(/\\n/g, '\n'),
    "client_email": process.env.client_email,
    "client_id": process.env.client_id,
    "auth_uri": process.env.auth_uri,
    "token_uri": process.env.token_uri,
    "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
    "client_x509_cert_url": process.env.client_x509_cert_url
  }),
  databaseURL: 'https://cdpu-helper.firebaseio.com'
});
let db = admin.firestore();
// END BLOCK: Initialize Firebase

// START BLOCK: Initialize Express
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
// END BLOCK: Initialize Express

var targetChannel = 'bot-testspace';
var compensate = 0; //compensation for mtlog

// START BLOCK: Code to run when server is restarted
var updateRef = db.collection('event').doc('update');
let getDoc = updateRef.get()
  .then(doc => {
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
  });
// END BLOCK: Code to run when server is restarted

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
function mRoutine(targetChannel, startTime, endTime, updateDate) { // startTime, endTime is in 2020-03-12T12:00:00 format
  mReminder(targetChannel, true, startTime, updateDate);
  mReminder(targetChannel, false, endTime, updateDate);
}
// end

// function for maintenance reminders
function mReminder(channel, isStartTime, time, updateDate) { //time is in 2020-03-21T12:44:44 format
  var tThirty = time.getTime() - (30 * 60 * 1000) - Date.now();
  var tTen = time.getTime() - (10 * 60 * 1000) - Date.now();
  var tTime = time.getTime() - Date.now();

  if (isStartTime == true) { //this is a reminder for maintenance start
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 10분 전", tTen);
    sendTimedMessage(channel, "*_Notice:_* 서버 점검 시작 @devops_emergency @spacebarley", tTime);
    sendTimedMessage(targetChannel, "*_Thread:_* `" + updateDate + " 점검 스레드`", tTime + 1); //+1 to prevent thread being created before reminder
  } else if (isStartTime == false) { //this is a reminder for maintenance end
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 10분 전", tTen);
    sendTimedMessage(channel, "*_Notice:_* 서버 점검 종료", tTime);
  }
}
// end

// function to handle parameters
function parameters(input) {
  var updateType = input.substring(0, 1);
  var year = input.substring(2, 4);
  var month = input.substring(4, 6);
  var day = input.substring(6, 8);
  var startHour = input.substring(9, 11);
  var startMinute = input.substring(11, 13);
  var endHour = input.substring(14, 16);
  var endMinute = input.substring(16, 18);

  var start = "20" + year + "-" + month + "-" + day + "T" + startHour + ":" + startMinute + ":00";
  var end = "20" + year + "-" + month + "-" + day + "T" + endHour + ":" + endMinute + ":00";
  var date = month + "/" + day;

  return [updateType, start, end, date];
}

// function to alert updates
function alertUpdate(updateType, startTime, endTime, updateDate) {
  switch (updateType) {
    case 'c':
      mRoutine(targetChannel, startTime, endTime, updateDate);
      sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 라이브 서버 오픈", endTime.getTime() - Date.now());
      sendTimedMessage(targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
      break;
    case 'h':
      mRoutine(targetChannel, startTime, endTime, updateDate);
      sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 라이브 서버 오픈", endTime.getTime() - Date.now());
      break;
    case 'n':
      sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
      sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
      sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작 @cd_production @console_qa", endTime.getTime() - Date.now());
      break;
      //case 'p': for pts
    default:
      console.log("Invalid updateType");
  }
}

// START BLOCK: Command Handler

app.post("/mtlog", (req, res) => {
  var today = new Date();
  var weekNum = Math.floor(today.getDate() / 7);
  var table = [":sarangcry:", ":kate_ps4:", ":coco2:", ":shibe-doge:"];

  var mtlogRef = db.collection('event').doc('mtlog');
  let getMTLog = mtlogRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        compensate = doc.data().compensate;
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });

  if (weekNum == 4) {
    let incrementCompensate = mtlogRef.set({
      'mtlog': compensate + 1
    });
    compensate++;
    weekNum = 0;
  }

  res.send();

  slack.chat.postMessage({
    token: process.env.token,
    channel: req.body.channel_id,
    text: (table[(weekNum + compensate) % 4]),
    link_names: 1
  }).catch(err => console.log(err))
});

app.post("/consoleupdate", (req, res) => {
  console.log(req.body.text);

  var updateType = parameters(req.body.text)[0];
  var startTime = new Date(parameters(req.body.text)[1]);
  var endTime = new Date(parameters(req.body.text)[2]);
  var updateDate = parameters(req.body.text)[3];

  let update = updateRef.set({
    'updateType': updateType,
    'startTime': startTime,
    'endTime': endTime,
    'updateDate': updateDate
  });

  res.send("OK, Update has been registered.");

  alertUpdate(updateType, startTime, endTime, updateDate);
});
// END BLOCK: Command Handler

app.listen(process.env.PORT, function() {
  console.log("Server is running");
});
