const express = require('express');
const bodyParser = require("body-parser");
const {
  WebClient
} = require('@slack/web-api'); //official slack web api
const web = new WebClient(process.env.token); //initialize
const admin = require('firebase-admin');
const fs = require('fs');

var update_reminder = require('./update_reminder');

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
console.log("[App] Update Alert targeting channel: " + targetChannel);

// START BLOCK: Code to run when server is restarted
// Retrieve last saved update info every 5 minutes
var updateRef = db.collection('event').doc('update');
setInterval(function() {
  let getDoc = updateRef.get()
    .then(doc => {
      console.log("[Alert Update] Last retrieved from DB: " + new Date());
      console.log("[Alert Update] startTime(DB): " + doc.data().startTime.toDate());
      console.log("[Alert Update] endTime(DB): " + doc.data().endTime.toDate());

      update_reminder.alertUpdate(doc.data().updateType, doc.data().startTime.toDate(), doc.data().endTime.toDate(), doc.data().updateDate);
    })
    .catch(err => {
      console.log('[Alert Update] Error getting document', err);
    });
}, 5 * 60 * 1000);
// END BLOCK: Code to run when server is restarted

// // function for sending message with a delay
// function sendTimedMessage(channel, text, time) {
//   setTimeout(function() {
//     web.chat.postMessage({
//       token: process.env.token,
//       channel,
//       text,
//       link_names: 1
//     }).catch(err => console.log(err))
//   }, time);
// };
// // end
//
// // function for maintenance reminders
// function mReminder(channel, isStartTime, time, updateDate) { //time is in 2020-03-21T12:44:44 format
//   var tThirty = time.getTime() - (30 * 60 * 1000) - Date.now();
//   var tTen = time.getTime() - (10 * 60 * 1000) - Date.now();
//   var tTime = time.getTime() - Date.now();
//
//   if (isStartTime == true) { //this is a reminder for maintenance start
//     sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 30분 전", tThirty);
//     sendTimedMessage(channel, "*_Reminder:_* 서버 점검 시작 10분 전", tTen);
//     sendTimedMessage(targetChannel, "*_Thread:_* `" + updateDate + " 점검 스레드`", tTime);
//   } else if (isStartTime == false) { //this is a reminder for maintenance end
//     sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 30분 전", tThirty);
//     sendTimedMessage(channel, "*_Reminder:_* 서버 점검 종료 10분 전", tTen);
//   }
// }
// // end
//
// // function to handle parameters
// function parameters(type, start, end, date) {
//
//   var updateType = type;
//   var date = date;
//   var start = date + "T" + start.substring(0, 2) + ":" + start.substring(2, 4) + ":00";
//   var end = date + "T" + end.substring(0, 2) + ":" + end.substring(2, 4) + ":00";
//
//   return [updateType, start, end, date];
// }
// // end
//
// // function to alert updates
// function alertUpdate(updateType, startTime, endTime, updateDate) {
//   if (new Date(startTime.getTime() - (30 * 60 * 1000)) > new Date() && new Date(endTime.getTime() - (30 * 60 * 1000)) > new Date() && new Date(startTime.getTime() - (30 * 60 * 1000)) < new Date(new Date().getTime() + (5 * 60 * 1000))) { //if it's more than 30 minutes before maintenance has started AND five minutes later it'll be less than 30 minutes before maintenance starts
//     console.log("[Alert Update] Reminders will be executed for startTime and endTime.");
//     switch (updateType) {
//       case 'f':
//         mReminder(targetChannel, true, startTime, updateDate);
//         sendTimedMessage(targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
//         break;
//       case 'l':
//         mReminder(targetChannel, true, startTime, updateDate);
//         break;
//       case 'm':
//         sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
//         sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
//         sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작", endTime.getTime() - Date.now());
//         break;
//         //case 'p': for pts
//       default:
//         console.log("[Alert Update] Invalid updateType");
//     }
//   } else if (startTime < new Date() && new Date(endTime.getTime() - (30 * 60 * 1000)) > new Date() && new Date(endTime.getTime() - (30 * 60 * 1000)) < new Date(new Date().getTime() + (5 * 60 * 1000))) { //if it's after maintenance has started, but more than 30 minutes before ended AND five minutes later it'll be less than 30 minutes before maintenance ends
//     console.log("[Alert Update] It is already past the startTime, executing reminders for endTime only.");
//     switch (updateType) {
//       case 'f':
//         mReminder(targetChannel, false, endTime, updateDate);
//         sendTimedMessage(targetChannel, "*_Reminder:_* PTS Close @devops_emergency", endTime.getTime() - Date.now());
//         break;
//       case 'l':
//         mReminder(targetChannel, false, endTime, updateDate);
//         break;
//       case 'm':
//         sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 30분 전", endTime.getTime() - (30 * 60 * 1000) - Date.now());
//         sendTimedMessage(targetChannel, "*_Reminder:_* 패치 배포(GA) 시작 10분 전", endTime.getTime() - (10 * 60 * 1000) - Date.now());
//         sendTimedMessage(targetChannel, "*_Notice:_* " + updateDate + " 패치 배포(GA) 시작", endTime.getTime() - Date.now());
//         break;
//         //case 'p': for pts
//       default:
//         console.log("[Alert Update] Invalid updateType");
//     }
//   } else {
//     console.log("[Alert Update] It is more than five minutes before maintenance start/end, or it is already past the endTime. Reminder request will be ignored.");
//   }
// }
// // end

// START BLOCK: Command Handler
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/mtlog", (req, res) => {
  var today = new Date();
  var table = [":sarang:", ":nara2:", ":coco2:", ":shibe-doge:", ":borrie:"];

  function getWeekNumber(targetDate) {
    targetDate.setUTCDate(targetDate.getUTCDate() + 4 - (targetDate.getUTCDay() || 7)); //set targetDate to nearest Thursday & change weekday 0 to 7
    var yearStart = new Date(Date.UTC(targetDate.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((targetDate - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }

  var mtlogRef = db.collection('event').doc('mtlog');
  let getMTLog = mtlogRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('[mtlog] No such document!');
      } else {
        emojiEntry = doc.data().emojiEntry;
        lastCalled = doc.data().lastCalled.toDate();

        if (getWeekNumber(lastCalled) != getWeekNumber(today)) //if this is the first time this code is being called this week
          emojiEntry = (emojiEntry + 1) % 5

        let updateLastCalled = mtlogRef.set({
          'lastCalled': today,
          'emojiEntry': emojiEntry
        });
        console.log("[mtlog] emojiEntry: " + emojiEntry + ", lastCalled: " + lastCalled);

        res.send();

        web.chat.postMessage({
          token: process.env.token,
          channel: req.body.channel_id,
          text: (table[emojiEntry]),
          link_names: 1
        }).catch(err => console.log(err))

      }
    })
    .catch(err => {
      console.log('[mtlog] Error getting document', err);
    });
});

// app.post("/consoleupdate", (req, res) => {
//   console.log("[Alert Update] Received input: " + req.body.text);
//
//   var updateType = parameters(req.body.text)[0];
//   var startTime = new Date(parameters(req.body.text)[1]);
//   var endTime = new Date(parameters(req.body.text)[2]);
//   var updateDate = parameters(req.body.text)[3];
//
//   let update = updateRef.set({
//     'updateType': updateType,
//     'startTime': startTime,
//     'endTime': endTime,
//     'updateDate': updateDate
//   });
//
//   res.send("OK, Update has been registered.");
// });

app.post("/interactive-endpoint", (req, res) => {
  const {
    type,
    user,
    trigger_id,
    view
  } = JSON.parse(req.body.payload);
  const view01 = fs.readFileSync('./shortcut_reminder_view01.json', 'utf8');

  if (type === "view_submission") {
    const updateType = view.state.values.updateType01.updateType02.selected_option.value;
    const updateDate = view.state.values.updateDate01.updateDate02.selected_date;
    const updateStart = view.state.values.updateStart01.updateStart02.value;
    const updateEnd = view.state.values.updateEnd01.updateEnd02.value;

    const updateParameters = update_reminder.parameters(updateType, updateStart, updateEnd, updateDate);
    //console.log(updateType + " " + updateDate + " " + updateStart + " " + updateEnd);
    let update = updateRef.set({
      'updateType': updateParameters[0],
      'startTime': new Date(updateParameters[1]),
      'endTime': new Date(updateParameters[2]),
      'updateDate': updateParameters[3]
    });
  } else {
    web.views.open({
      token: process.env.token,
      trigger_id: trigger_id,
      view: view01
    }).catch(err => console.log(err))
  }
  res.send();
});
// END BLOCK: Command Handler

app.listen(5000, function() {
  console.log("[App] Server is running on port " + 5000);
});
