// Load Packages
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const port = process.env.PORT || 5000;
//old packages - delete
const config = require('./config');
const update_reminder = require('./update_reminder');
const mtlog = require('./mtlog');

// Firebase DB
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
    databaseURL: "https://cdpu-helper.firebaseio.com"
});
export const db = admin.firestore();
// console log successful db connection

// Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Retrieve the quickest approaching reminder every 5 minutes
setInterval( () => {
  let first_reminder = db.collection('reminders').orderBy("target_date").orderBy("start_time").limit(1).get()
    .then(doc => {
      console.log("[Alert Update] Last retrieved from DB: " + new Date());

      update_reminder.alertUpdate(doc.data().updateType, doc.data().startTime.toDate(), doc.data().endTime.toDate(), doc.data().updateDate);
    })
    .catch(err => {
      console.log('[Alert Update] Error getting document', err);
    });
}, 5 * 60 * 1000);
// END BLOCK: Code to run when server is restarted

/*
// START BLOCK: Command Handler
app.post("/mtlog", (req, res) => {
  var today = new Date();
  var table = [":sarang:", ":nara2:", ":coco2:", ":borrie:"];


  var mtlogRef = db.collection('event').doc('mtlog');
  let getMTLog = mtlogRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log('[mtlog] No such document!');
      } else {
        emojiEntry = doc.data().emojiEntry;
        lastCalled = doc.data().lastCalled.toDate();

        if (mtlog.getWeekNumber(lastCalled) != mtlog.getWeekNumber(today)) //if this is the first time this code is being called this week
          emojiEntry = (emojiEntry + 1) % 4

        let updateLastCalled = mtlogRef.set({
          'lastCalled': today,
          'emojiEntry': emojiEntry
        });
        console.log("[mtlog] emojiEntry: " + table[emojiEntry] + ", lastCalled: " + lastCalled);

        res.send();

        config.web.chat.postMessage({
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

app.post("/interactive-endpoint", (req, res) => {
  const {
    type,
    user,
    trigger_id,
    view
  } = JSON.parse(req.body.payload);
  const view01 = config.fs.readFileSync('./shortcut_reminder_view01.json', 'utf8');

  if (type === "view_submission") {
    const updateType = view.state.values.updateType01.updateType02.selected_option.value;
    const updateDate = view.state.values.updateDate01.updateDate02.selected_date;
    const updateStart = view.state.values.updateStart01.updateStart02.value;
    const updateEnd = view.state.values.updateEnd01.updateEnd02.value;

    const updateParameters = update_reminder.parameters(updateDate, updateStart, updateEnd);
    let update = updateRef.set({
      'updateType': updateType,
      'startTime': new Date(updateParameters[0]),
      'endTime': new Date(updateParameters[1]),
      'updateDate': updateDate
    });
  } else {
    config.web.views.open({
      token: process.env.token,
      trigger_id: trigger_id,
      view: view01
    }).catch(err => console.log(err))
  }
  res.send();
});
// END BLOCK: Command Handler
*/

// Model

// Router
require("./routes/reminder_route")(app);

// Service
const reminder_service = require("./services/reminder_service")(app);
reminder_service.check_db_update();

// Run
app.listen(port, function() {
  console.log("[App] Server is running on port " + port);
});
