const express = require('express');
const bodyParser = require("body-parser");
const slack = require("slack");
const admin = require('firebase-admin');

// START BLOCK: Keep heroku alive
/*
var http = require("http");
setInterval(function() {
  http.get("http://frozen-wave-50664.herokuapp.com");
  console.log("Stay alive! " + new Date());
}, 1200000);
*/
// END BLOCK: Keep heroku alive

// START BLOCK: Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert({
    "type": process.env.type,
    "project_id": process.env.project_id,
    "private_key_id": process.env.private_key_id,
    "private_key": process.env.private_key_1.replace(/\\n/g, '\n') + process.env.private_key_2.replace(/\\n/g, '\n'),
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

var targetChannel = 'bot-testspace'; // TAKE CAUTION @@@@@@@@@@@@@@@@@@@@@@@@@@@

// START BLOCK: Code to run when server is restarted
// Retrieve last saved update info
var updateRef = db.collection('event').doc('update');
let getDoc = updateRef.get()
  .then(doc => {
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      //console.log('Document data:', doc.data()); Displays entire DB document
      console.log("startTime(DB): " + doc.data().startTime.toDate());
      console.log("endTime(DB): " + doc.data().endTime.toDate());
      console.log("Time(Current): " + new Date());

      alertUpdate(doc.data().updateType, doc.data().startTime.toDate(), doc.data().endTime.toDate(), doc.data().updateDate);
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
  });

// Retrieve mtlog compensate value

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
    sendTimedMessage(channel, "*_Notice:_* 서버 점검 시작 @devops_emergency", tTime);
    sendTimedMessage(targetChannel, "*_Thread:_* `" + updateDate + " 점검 스레드`", tTime + 1); //+1 to prevent thread being created before reminder
  } else if (isStartTime == false) { //this is a reminder for maintenance end
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 30분 전", tThirty);
    sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 10분 전", tTen);
    sendTimedMessage(channel, "*_Notice:_* " + updateDate + " 라이브 서버 오픈", tTime);
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
  if (startTime > new Date() && endTime > new Date()) { //if it's before maintenance has started
    console.log("Reminders will be executed for startTime and endTime.");
    switch (updateType) {
      case 'f':
        mRoutine(targetChannel, startTime, endTime, updateDate);
        sendTimedMessage(targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
        break;
      case 'l':
        mRoutine(targetChannel, startTime, endTime, updateDate);
        break;
      case 'm':
        sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
        sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
        sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작", endTime.getTime() - Date.now());
        break;
        //case 'p': for pts
      default:
        console.log("Invalid updateType");
    }
  } else if (startTime < new Date() && endTime > new Date()) { //if it's after maintenance has started, but before ended
    console.log("It is already past the startTime, executing reminders for endTime only.");
    switch (updateType) {
      case 'f':
        mReminder(targetChannel, false, endTime, updateDate);
        sendTimedMessage(targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
        break;
      case 'l':
        mReminder(targetChannel, false, endTime, updateDate);
        break;
      case 'm':
        sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
        sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
        sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작", endTime.getTime() - Date.now());
        break;
        //case 'p': for pts
      default:
        console.log("Invalid updateType");
    }
  } else {
    console.log("It is already past the endTime, no reminders will be executed.");
  }
}

// START BLOCK: Command Handler

app.post("/mtlog", (req, res) => {
  var today = new Date();
  var weekNum = Math.floor((today.getDate() - 1) / 7);
  var table = [":sarangcry:", ":kate_ps4:", ":coco2:", ":shibe-doge:"];

  var mtlogRef = db.collection('event').doc('mtlog');
  let getMTLog = mtlogRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        compensate = doc.data().compensate;
        lastCalled = doc.data().lastCalled.toDate();

        if (weekNum == 4 && Math.floor((lastCalled.getDate() - 1) / 7) != 4) { //if this is the first time this code is being called in a fifth week
          compensate++;
          weekNum = 0;
        }

        let updateLastCalled = mtlogRef.set({
          'lastCalled': today,
          'compensate': compensate
        });
        console.log("Compensate: " + compensate + ", lastCalled: " + lastCalled);

        res.send();

        slack.chat.postMessage({
          token: process.env.token,
          channel: req.body.channel_id,
          text: (table[(weekNum + compensate) % 4]),
          link_names: 1
        }).catch(err => console.log(err))

      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });


});

app.post("/consoleupdate", (req, res) => {
  console.log("Received input: " + req.body.text);

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
  console.log("Server is running on port " + process.env.PORT);
});
